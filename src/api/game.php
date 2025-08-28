<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

require_once 'config.php';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Zkontrolujeme, jestli nám přišlo ID v URL
    $game_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    // Pokud je ID neplatné, pošleme chybovou zprávu
    if ($game_id <= 0) {
        http_response_code(400); // Bad Request
        echo json_encode([
            "status" => "error",
            "message" => "Bylo zadáno neplatné nebo chybějící ID hry."
        ]);
        exit();
    }

    // Připravíme si dotaz na jednu konkrétní hru
    $sql = "SELECT * FROM games WHERE game_id = ? AND is_active = TRUE";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$game_id]);
    
    $game = $stmt->fetch(PDO::FETCH_ASSOC);

    // --- Odeslání výsledku ---
    if ($game) {
        // Hru jsme našli, pošleme její data
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "data" => $game
        ]);
    } else {
        // Hra s daným ID v databázi není
        http_response_code(404); // Not Found
        echo json_encode([
            "status" => "error",
            "message" => "Hra s tímto ID nebyla nalezena."
        ]);
    }

} catch (PDOException $e) {
    // Tento blok zachytí chybu připojení i chybu v SQL dotazu
    http_response_code(500); // Internal Server Error
    echo json_encode([
        "status" => "error",
        "message" => "Chyba na straně serveru: " . $e->getMessage()
    ]);
}
?>
