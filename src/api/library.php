<?php
// POZOR: session_start() už NEvoláme - je v headers.php!
require_once './headers.php'; // Načte konfiguraci a hlavičky

// 1. Ověření, zda je uživatel přihlášen
if (!isset($_SESSION['user_id'])) {
    send_json_error('Pro přístup do knihovny se musíte přihlásit.', 401); // 401 Unauthorized
}
$user_id = $_SESSION['user_id'];

// 2. Připojení k databázi už je v headers.php jako $pdo

try {
    // 3. Hlavní SQL dotaz pro získání her v knihovně uživatele
    // Spojuje tabulky user_library, games, game_keys a publishers
    $sql = "
        SELECT
            ul.library_id,
            ul.purchase_date,
            ul.last_accessed,
            ul.play_time_hours,
            ul.is_favorite,
            ul.rating,
            ul.notes,
            g.game_id,
            g.name AS game_name,
            g.description AS game_description,
            g.image_url AS game_image_url,
            gk.key_code,
            p.name AS publisher_name
        FROM user_library ul
        JOIN games g ON ul.game_id = g.game_id
        JOIN game_keys gk ON ul.key_id = gk.key_id
        LEFT JOIN publishers p ON g.publisher_id = p.publisher_id
        WHERE ul.user_id = ?
        ORDER BY ul.purchase_date DESC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user_id]);
    $library_items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Pokud uživatel nemá žádné hry, vrátíme prázdné pole
    if (empty($library_items)) {
        echo json_encode(['success' => true, 'data' => []]);
        exit();
    }

    // 4. Efektivní načtení všech žánrů pro všechny hry najednou
    $game_ids = array_column($library_items, 'game_id');
    $placeholders = implode(',', array_fill(0, count($game_ids), '?'));

    $sql_genres = "
        SELECT
            gg.game_id,
            gn.name as genre_name
        FROM game_genres gg
        JOIN genres gn ON gg.genre_id = gn.genre_id
        WHERE gg.game_id IN ($placeholders)
    ";
    
    $stmt_genres = $pdo->prepare($sql_genres);
    $stmt_genres->execute($game_ids);
    $genres_flat = $stmt_genres->fetchAll(PDO::FETCH_ASSOC);

    // Zpracování žánrů do pole, kde klíčem je game_id
    $genres_by_game = [];
    foreach ($genres_flat as $genre) {
        $genres_by_game[$genre['game_id']][] = ['name' => $genre['genre_name']];
    }

    // 5. Sestavení finální struktury dat, kterou očekává React
    $final_data = [];
    foreach ($library_items as $item) {
        $final_data[] = [
            'library_id' => (int)$item['library_id'],
            'game' => [
                'game_id' => (int)$item['game_id'],
                'name' => $item['game_name'],
                'description' => $item['game_description'],
                'image_url' => $item['game_image_url'],
                'genres' => $genres_by_game[$item['game_id']] ?? [], // Přidáme žánry
                'publisher' => [
                    'name' => $item['publisher_name']
                ]
            ],
            'key_code' => $item['key_code'],
            'purchase_date' => $item['purchase_date'],
            'last_accessed' => $item['last_accessed'],
            'play_time_hours' => (float)$item['play_time_hours'],
            'is_favorite' => (bool)$item['is_favorite'],
            'rating' => (int)$item['rating'],
            'notes' => $item['notes']
        ];
    }

    // 6. Odeslání úspěšné odpovědi
    echo json_encode(['success' => true, 'data' => $final_data]);

} catch (PDOException $e) {
    send_json_error('Chyba při načítání knihovny: ' . $e->getMessage(), 500);
}
?>