<?php
require_once './headers.php';

try {
    $stmt = $pdo->query("SELECT name, slug FROM genres ORDER BY name ASC");
    $genres = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $genres]);

} catch (PDOException $e) {
    send_json_error('Chyba databáze: ' . $e->getMessage(), 500);
}
?>