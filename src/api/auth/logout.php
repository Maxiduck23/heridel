<?php
// POZOR: session_start() už NEvoláme - je v headers.php!
require_once '../headers.php'; // Načte konfiguraci a hlavičky

// Zničí všechny session proměnné
$_SESSION = array();

// Zničí session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Nakonec zničí session samotnou
session_destroy();

// Odešle úspěšnou odpověď ve formátu JSON
echo json_encode(['success' => true, 'message' => 'Odhlášení proběhlo úspěšně.']);
?>