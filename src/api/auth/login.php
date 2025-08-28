<?php
// POZOR: session_start() už NEvoláme - je v headers.php!
require_once '../headers.php'; // Načte konfiguraci o úroveň výš

// Zpracování vstupních dat
$input = json_decode(file_get_contents('php://input'), true);
$login_username = $input['username'] ?? '';
$login_password = $input['password'] ?? '';

if (empty($login_username) || empty($login_password)) {
    send_json_error('Chybí uživatelské jméno nebo heslo.');
}

// Vyhledání uživatele v databázi
try {
    // $pdo už je připojené z headers.php
    $stmt = $pdo->prepare("SELECT user_id, username, password_hash, tokens_balance FROM users WHERE username = ?");
    $stmt->execute([$login_username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Ověření hesla
    if (!$user || !password_verify($login_password, $user['password_hash'])) {
        send_json_error('Nesprávné přihlašovací údaje.');
        exit;
    }

    // Uložení do session
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['username'] = $user['username'];

    // Odeslání úspěšné odpovědi
    echo json_encode([
        'success' => true,
        'user' => [
            'user_id' => $user['user_id'],
            'username' => $user['username'],
            'tokens_balance' => (float)$user['tokens_balance']
        ]
    ]);

} catch (PDOException $e) {
    send_json_error('Chyba databáze při přihlašování.', 500);
}
?>