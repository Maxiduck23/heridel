<?php
require_once './headers.php';

$game_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($game_id <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Nebylo zadáno platné ID hry.'
    ]);
    exit;
}

try {
    // Hlavní dotaz na hru s publisherem
    $stmt = $pdo->prepare("
        SELECT g.*, p.name AS publisher_name 
        FROM games g 
        LEFT JOIN publishers p ON g.publisher_id = p.publisher_id 
        WHERE g.game_id = ? AND g.is_active = TRUE
    ");
    $stmt->execute([$game_id]);
    $game = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$game) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Hra s tímto ID nebyla nalezena.'
        ]);
        exit;
    }

    // Dotaz na žánry
    $stmt_genres = $pdo->prepare("
        SELECT gn.name 
        FROM genres gn 
        JOIN game_genres gg ON gn.genre_id = gg.genre_id 
        WHERE gg.game_id = ?
    ");
    $stmt_genres->execute([$game_id]);
    $game['genres'] = $stmt_genres->fetchAll(PDO::FETCH_COLUMN);

    // Kontrola stavu pro přihlášeného uživatele
    $game['is_owned'] = false;
    $game['in_wishlist'] = false;

    if (isset($_SESSION['user_id'])) {
        $user_id = $_SESSION['user_id'];

        // Kontrola vlastnictví
        $stmt_owned = $pdo->prepare("SELECT COUNT(*) FROM user_library WHERE user_id = ? AND game_id = ?");
        $stmt_owned->execute([$user_id, $game_id]);
        if ($stmt_owned->fetchColumn() > 0) {
            $game['is_owned'] = true;
        }

        // Kontrola wishlistu
        $stmt_wishlist = $pdo->prepare("SELECT COUNT(*) FROM user_wishlist WHERE user_id = ? AND game_id = ?");
        $stmt_wishlist->execute([$user_id, $game_id]);
        if ($stmt_wishlist->fetchColumn() > 0) {
            $game['in_wishlist'] = true;
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $game
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Chyba databáze: ' . $e->getMessage()
    ]);
}
?>