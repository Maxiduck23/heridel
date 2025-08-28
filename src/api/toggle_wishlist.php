<?php
session_start();
require_once './headers.php';

// 1. Ověření, zda je uživatel přihlášen
if (!isset($_SESSION['user_id'])) {
    send_json_error('Pro přidání do přání se musíte přihlásit.', 401);
}
$user_id = $_SESSION['user_id'];

// 2. Získání ID hry z Reactu
$input = json_decode(file_get_contents('php://input'), true);
$game_id = $input['game_id'] ?? 0;
if ($game_id <= 0) {
    send_json_error('Nebylo vybráno platné ID hry.');
}

// 3. Připojení k databázi
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    send_json_error('Chyba připojení k databázi.', 500);
}

try {
    // Zjistíme, zda už hra v seznamu přání je
    $stmt = $pdo->prepare("SELECT wishlist_id FROM user_wishlist WHERE user_id = ? AND game_id = ?");
    $stmt->execute([$user_id, $game_id]);
    $existing = $stmt->fetch();

    if ($existing) {
        // Pokud ano, odebereme ji
        $stmt_delete = $pdo->prepare("DELETE FROM user_wishlist WHERE wishlist_id = ?");
        $stmt_delete->execute([$existing['wishlist_id']]);
        $in_wishlist = false;
        $message = 'Hra byla odebrána ze seznamu přání.';
    } else {
        // Pokud ne, přidáme ji
        $stmt_insert = $pdo->prepare("INSERT INTO user_wishlist (user_id, game_id) VALUES (?, ?)");
        $stmt_insert->execute([$user_id, $game_id]);
        $in_wishlist = true;
        $message = 'Hra byla přidána do seznamu přání.';
    }

    echo json_encode([
        'success' => true,
        'message' => $message,
        'in_wishlist' => $in_wishlist
    ]);

} catch (Exception $e) {
    send_json_error('Během operace nastala chyba: ' . $e->getMessage(), 500);
}
?>