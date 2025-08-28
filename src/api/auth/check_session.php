<?php
require_once '../headers.php';

// Add debugging for session issues
error_log("Check session called - Session ID: " . session_id());
error_log("Session data: " . print_r($_SESSION, true));

try {
    if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
        // Get fresh user data from database
        $stmt = $pdo->prepare("SELECT user_id, username, email, tokens_balance, is_admin, created_at FROM users WHERE user_id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // Ensure tokens_balance is a proper number
            $user['tokens_balance'] = floatval($user['tokens_balance']);
            $user['is_admin'] = boolval($user['is_admin']);
            
            echo json_encode([
                'success' => true,
                'user' => $user,
                'session_id' => session_id()
            ]);
        } else {
            // User not found in database, clear session
            session_destroy();
            echo json_encode(['success' => false, 'message' => 'User not found']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No active session']);
    }
} catch (PDOException $e) {
    error_log("Database error in check_session: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error']);
} catch (Exception $e) {
    error_log("General error in check_session: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>