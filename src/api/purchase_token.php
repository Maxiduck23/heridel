<?php
session_start();
require_once './headers.php';

// Ověření přihlášení
if (!isset($_SESSION['user_id'])) {
    send_json_error('Pro nákup tokenů se musíte přihlásit.', 401);
}

$user_id = $_SESSION['user_id'];

// Získání dat z Reactu
$input = json_decode(file_get_contents('php://input'), true);
$pack_id = $input['pack_id'] ?? 0;
$payment_method = $input['payment_method'] ?? '';

if ($pack_id <= 0) {
    send_json_error('Nebyl vybrán platný balíček tokenů.');
}

if (empty($payment_method)) {
    send_json_error('Nebyl vybrán způsob platby.');
}

// Definice balíčků (stejné jako v TokenPage)
$token_packs = [
    1 => ['amount' => 100, 'bonus' => 0, 'price' => 25, 'currency' => 'Kč'],
    2 => ['amount' => 500, 'bonus' => 50, 'price' => 120, 'currency' => 'Kč'],
    3 => ['amount' => 1000, 'bonus' => 200, 'price' => 220, 'currency' => 'Kč'],
    4 => ['amount' => 2500, 'bonus' => 750, 'price' => 500, 'currency' => 'Kč'],
    5 => ['amount' => 5000, 'bonus' => 2000, 'price' => 900, 'currency' => 'Kč']
];

// Validace balíčku
if (!isset($token_packs[$pack_id])) {
    send_json_error('Neplatný balíček tokenů.');
}

$pack = $token_packs[$pack_id];
$total_tokens = $pack['amount'] + $pack['bonus'];

// Zahájení transakce
$pdo->beginTransaction();

try {
    // Získání aktuálního zůstatku uživatele
    $stmt = $pdo->prepare("SELECT tokens_balance FROM users WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception('Uživatel nenalezen.');
    }
    
    // Přidání tokenů k zůstatku
    $new_balance = $user['tokens_balance'] + $total_tokens;
    
    $stmt = $pdo->prepare("
        UPDATE users 
        SET tokens_balance = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = ?
    ");
    $stmt->execute([$new_balance, $user_id]);
    
    // Vytvoření záznamu o objednávce
    $stmt = $pdo->prepare("
        INSERT INTO orders (user_id, total_tokens, status, payment_method, created_at) 
        VALUES (?, ?, 'completed', ?, CURRENT_TIMESTAMP)
    ");
    $stmt->execute([$user_id, -$total_tokens, $payment_method]); // Záporné číslo pro nákup tokenů
    $order_id = $pdo->lastInsertId();
    
    // Záznam transakce tokenů
    $stmt = $pdo->prepare("
        INSERT INTO token_transactions (user_id, amount, transaction_type, reference_order_id, description, created_at) 
        VALUES (?, ?, 'purchase', ?, ?, CURRENT_TIMESTAMP)
    ");
    $description = "Nákup {$pack['amount']} + {$pack['bonus']} tokenů za {$pack['price']} {$pack['currency']}";
    $stmt->execute([$user_id, $total_tokens, $order_id, $description]);
    
    // Potvrzení transakce
    $pdo->commit();
    
    // Úspěšná odpověď
    echo json_encode([
        'success' => true,
        'message' => "Úspěšně zakoupeno {$total_tokens} tokenů!",
        'new_balance' => $new_balance,
        'tokens_purchased' => $total_tokens,
        'order_id' => $order_id
    ]);

} catch (Exception $e) {
    // Vrácení změn při chybě
    $pdo->rollBack();
    send_json_error('Chyba při zpracování platby: ' . $e->getMessage(), 500);
}
?>