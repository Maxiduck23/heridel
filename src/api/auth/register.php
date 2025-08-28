<?php
// POZOR: session_start() už NEvoláme - je v headers.php!
require_once '../headers.php'; // Načte konfiguraci o úroveň výš

// Zpracování vstupních dat z Reactu
$input = json_decode(file_get_contents('php://input'), true);
$reg_username = $input['username'] ?? '';
$reg_email = $input['email'] ?? '';
$reg_password = $input['password'] ?? '';

// --- Validace vstupů ---
if (empty($reg_username) || empty($reg_email) || empty($reg_password)) {
    send_json_error('Všechny pole jsou povinné.');
}
if (strlen($reg_username) < 3) {
    send_json_error('Uživatelské jméno musí mít alespoň 3 znaky.');
}
if (!filter_var($reg_email, FILTER_VALIDATE_EMAIL)) {
    send_json_error('Zadejte platnou e-mailovou adresu.');
}
if (strlen($reg_password) < 6) {
    send_json_error('Heslo musí mít alespoň 6 znaků.');
}

try {
    // $pdo už je připojené z headers.php
    
    // Zkontrolujeme, zda uživatel nebo e-mail již neexistuje
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$reg_username, $reg_email]);
    if ($stmt->fetchColumn() > 0) {
        send_json_error('Uživatelské jméno nebo e-mail je již používán.');
    }

    // --- Hashování hesla (klíčová část) ---
    $password_hash = password_hash($reg_password, PASSWORD_DEFAULT);

    // Vložení nového uživatele do databáze
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
    $stmt->execute([$reg_username, $reg_email, $password_hash]);

    // Získání ID nově vytvořeného uživatele
    $user_id = $pdo->lastInsertId();

    // Automatické přihlášení uživatele po registraci
    $_SESSION['user_id'] = $user_id;
    $_SESSION['username'] = $reg_username;

    // Odeslání úspěšné odpovědi s daty nového uživatele
    echo json_encode([
        'success' => true,
        'user' => [
            'user_id' => $user_id,
            'username' => $reg_username,
            'tokens_balance' => 0.00 // Nový uživatel začíná s 0 tokeny
        ]
    ]);

} catch (PDOException $e) {
    send_json_error('Chyba databáze při registraci: ' . $e->getMessage(), 500);
}
?>