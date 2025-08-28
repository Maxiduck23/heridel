
<?php
require_once './headers.php';

try {
    $stmt_featured = $pdo->query("SELECT game_id, name, description, image_url FROM games WHERE is_active = TRUE ORDER BY release_date DESC LIMIT 1");
    $featuredGame = $stmt_featured->fetch(PDO::FETCH_ASSOC);

    $stmt_popular = $pdo->query("SELECT game_id, name, price_tokens, image_url FROM games WHERE is_active = TRUE ORDER BY RAND() LIMIT 8");
    $popularGames = $stmt_popular->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => [
            'featuredGame' => $featuredGame,
            'popularGames' => $popularGames
        ]
    ]);

} catch (PDOException $e) {
    send_json_error('Chyba databáze: ' . $e->getMessage(), 500);
}
?>