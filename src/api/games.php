<?php
// PŘIDÁNO - session a headers  
session_start();
require_once './headers.php';

try {
    // Získání žánrového filtru z URL parametru
    $genreSlug = $_GET['genre'] ?? null;
    $params = [];
    $whereClause = "WHERE g.is_active = TRUE"; // PŘIDÁNO - základní podmínka

    // Pokud byl žánr poslán, upravíme SQL dotaz
    if ($genreSlug && $genreSlug !== 'all') {
        $whereClause .= " AND gn.slug = ?";
        $params[] = $genreSlug;
        
        // SQL s JOIN pro žánry
        $sql = "SELECT DISTINCT g.game_id, g.name, g.price_tokens, g.image_url, g.description, g.release_date,
                       p.name as publisher_name
                FROM games g
                LEFT JOIN publishers p ON g.publisher_id = p.publisher_id
                JOIN game_genres gg ON g.game_id = gg.game_id
                JOIN genres gn ON gg.genre_id = gn.genre_id
                $whereClause
                ORDER BY g.name ASC";
    } else {
        // SQL bez filtru žánru
        $sql = "SELECT g.game_id, g.name, g.price_tokens, g.image_url, g.description, g.release_date,
                       p.name as publisher_name
                FROM games g
                LEFT JOIN publishers p ON g.publisher_id = p.publisher_id
                $whereClause
                ORDER BY g.name ASC";
    }

    // Připravíme a spustíme dotaz
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $games = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Pokud je uživatel přihlášen, přidáme informace o vlastnictví
    if (isset($_SESSION['user_id'])) {
        $user_id = $_SESSION['user_id'];
        
        foreach ($games as &$game) {
            // Kontrola vlastnictví
            $stmt_owned = $pdo->prepare("SELECT COUNT(*) FROM user_library WHERE user_id = ? AND game_id = ?");
            $stmt_owned->execute([$user_id, $game['game_id']]);
            $game['is_owned'] = $stmt_owned->fetchColumn() > 0;

            // Kontrola wishlistu
            $stmt_wishlist = $pdo->prepare("SELECT COUNT(*) FROM user_wishlist WHERE user_id = ? AND game_id = ?");
            $stmt_wishlist->execute([$user_id, $game['game_id']]);
            $game['in_wishlist'] = $stmt_wishlist->fetchColumn() > 0;
            
            // Načtení žánrů pro každou hru
            $stmt_genres = $pdo->prepare("
                SELECT gn.name 
                FROM genres gn 
                JOIN game_genres gg ON gn.genre_id = gg.genre_id 
                WHERE gg.game_id = ?
            ");
            $stmt_genres->execute([$game['game_id']]);
            $game['genres'] = $stmt_genres->fetchAll(PDO::FETCH_COLUMN);
        }
    } else {
        // Pro nepřihlášené uživatele
        foreach ($games as &$game) {
            $game['is_owned'] = false;
            $game['in_wishlist'] = false;
            
            // Načtení žánrů
            $stmt_genres = $pdo->prepare("
                SELECT gn.name 
                FROM genres gn 
                JOIN game_genres gg ON gn.genre_id = gg.genre_id 
                WHERE gg.game_id = ?
            ");
            $stmt_genres->execute([$game['game_id']]);
            $game['genres'] = $stmt_genres->fetchAll(PDO::FETCH_COLUMN);
        }
    }

    // Odešleme data jako JSON
    echo json_encode(['success' => true, 'data' => $games]);

} catch (PDOException $e) {
    // Odešleme chybovou odpověď
    send_json_error('Chyba databáze: ' . $e->getMessage(), 500);
}
?>