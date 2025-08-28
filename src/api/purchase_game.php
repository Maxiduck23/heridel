<?php
// POZOR: session_start() už NEvoláme - je v headers.php!
require_once './headers.php';

// 1. Ověření, zda je uživatel přihlášen
if (!isset($_SESSION['user_id'])) {
    send_json_error('Pro nákup se musíte přihlásit.', 401);
}
$user_id = $_SESSION['user_id'];

// 2. Získání ID hry z Reactu
$input = json_decode(file_get_contents('php://input'), true);
$game_id = $input['game_id'] ?? 0;
if ($game_id <= 0) {
    send_json_error('Nebylo vybráno platné ID hry.');
}

// 3. Připojení k databázi už je v headers.php jako $pdo

// 4. === ZAHÁJENÍ DATABÁZOVÉ TRANSAKCE ===
// Tím zajistíme, že se všechny operace provedou, nebo žádná.
$pdo->beginTransaction();

try {
    // Krok A: Získání informací o hře a uživateli
    $stmt_info = $pdo->prepare("SELECT price_tokens FROM games WHERE game_id = ?");
    $stmt_info->execute([$game_id]);
    $game = $stmt_info->fetch(PDO::FETCH_ASSOC);

    $stmt_user = $pdo->prepare("SELECT tokens_balance FROM users WHERE user_id = ?");
    $stmt_user->execute([$user_id]);
    $user = $stmt_user->fetch(PDO::FETCH_ASSOC);

    // Krok B: Validace (kontrola, zda hra existuje, zda má uživatel dostatek tokenů atd.)
    if (!$game) send_json_error('Hra neexistuje.');
    if ($user['tokens_balance'] < $game['price_tokens']) send_json_error('Nemáte dostatek tokenů k nákupu.');

    $stmt_owned = $pdo->prepare("SELECT COUNT(*) FROM user_library WHERE user_id = ? AND game_id = ?");
    $stmt_owned->execute([$user_id, $game_id]);
    if ($stmt_owned->fetchColumn() > 0) send_json_error('Tuto hru již vlastníte.');

    // Krok C: Najít volný herní klíč
    $stmt_key = $pdo->prepare("SELECT key_id FROM game_keys WHERE game_id = ? AND is_sold = FALSE LIMIT 1");
    $stmt_key->execute([$game_id]);
    $key = $stmt_key->fetch(PDO::FETCH_ASSOC);
    if (!$key) send_json_error('Omlouváme se, pro tuto hru nejsou momentálně žádné klíče k dispozici.', 503);
    $key_id = $key['key_id'];

    // Krok D: Provedení změn v databázi
    // 1. Označit klíč jako prodaný
    $pdo->prepare("UPDATE game_keys SET is_sold = TRUE, sold_at = NOW() WHERE key_id = ?")->execute([$key_id]);
    // 2. Snížit počet tokenů uživatele
    $new_balance = $user['tokens_balance'] - $game['price_tokens'];
    $pdo->prepare("UPDATE users SET tokens_balance = ? WHERE user_id = ?")->execute([$new_balance, $user_id]);
    // 3. Vytvořit záznam o objednávce
    $pdo->prepare("INSERT INTO orders (user_id, total_tokens, status) VALUES (?, ?, 'completed')")->execute([$user_id, $game['price_tokens']]);
    $order_id = $pdo->lastInsertId();
    // 4. Vytvořit položku objednávky
    $pdo->prepare("INSERT INTO order_items (order_id, game_id, key_id, tokens_spent) VALUES (?, ?, ?, ?)")->execute([$order_id, $game_id, $key_id, $game['price_tokens']]);
    // 5. Přidat hru do knihovny uživatele
    $pdo->prepare("INSERT INTO user_library (user_id, game_id, key_id) VALUES (?, ?, ?)")->execute([$user_id, $game_id, $key_id]);
    // 6. Zaznamenat transakci tokenů
    $pdo->prepare("INSERT INTO token_transactions (user_id, amount, transaction_type, reference_order_id) VALUES (?, ?, 'spend', ?)")->execute([$user_id, -$game['price_tokens'], $order_id]);

    // 5. === POTVRZENÍ TRANSAKCE ===
    // Pokud vše proběhlo v pořádku, trvale uložíme změny
    $pdo->commit();

    // 6. Odeslání úspěšné odpovědi
    echo json_encode([
        'success' => true,
        'message' => 'Hra byla úspěšně zakoupena!',
        'new_balance' => $new_balance
    ]);

} catch (Exception $e) {
    // 7. === VRÁCENÍ ZMĚN ===
    // Pokud nastala jakákoli chyba, vrátíme databázi do původního stavu
    $pdo->rollBack();
    send_json_error('Během nákupu nastala chyba: ' . $e->getMessage(), 500);
}
?>