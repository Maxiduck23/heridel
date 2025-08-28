<?php
// Start output buffering to prevent header issues
ob_start();

// Get the origin of the request
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Define allowed origins
$allowed_origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://heridel.wz.cz',
    'https://heridel.wz.cz'
];

// Set CORS headers - OPRAVENO pro všechny requesty
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $origin);
} else {
    // Fallback pro development
    header("Access-Control-Allow-Origin: http://localhost:5173");
}

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Max-Age: 86400"); // Cache preflight for 24 hours

// Handle preflight OPTIONS requests - DŮLEŽITÉ
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Session configuration
if (session_status() === PHP_SESSION_NONE) {
    $cookie_lifetime = 86400; // 24 hours
    $cookie_path = '/';
    $cookie_domain = '';
    $cookie_secure = false; // Set to true if using HTTPS
    $cookie_httponly = true;
    
    // Configure session settings
    ini_set('session.gc_maxlifetime', $cookie_lifetime);
    ini_set('session.cookie_lifetime', $cookie_lifetime);
    ini_set('session.cookie_httponly', $cookie_httponly);
    ini_set('session.use_strict_mode', 1);
    
    session_set_cookie_params(
        $cookie_lifetime,
        $cookie_path,
        $cookie_domain,
        $cookie_secure,
        $cookie_httponly
    );
    
    session_start();
}

// Database configuration
$host = 'sql6.webzdarma.cz';
$dbname = 'heridelwzcz8133';
$username = 'heridelwzcz8133';
$password = '83.46.18.Bn!'; 
$charset = 'utf8mb4';

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

function send_json_error($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false, 
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s'),
        'session_id' => session_id()
    ]);
    exit();
}

function send_json_success($data, $message = null) {
    http_response_code(200);
    $response = [
        'success' => true,
        'data' => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    if ($message) {
        $response['message'] = $message;
    }
    echo json_encode($response);
    exit();
}

try {
    $dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES $charset",
    ];
    
    $pdo = new PDO($dsn, $username, $password, $options);
    
    // Test connection
    $pdo->query('SELECT 1');
    
} catch (\PDOException $e) {
    error_log("DB Connection Error: " . $e->getMessage());
    send_json_error("Database connection failed", 500);
}
?>