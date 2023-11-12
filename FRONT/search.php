<?php
$host = getenv('DB_HOST');
$port = getenv('DB_PORT');
$dbname = getenv('DB_NAME');
$user = getenv('DB_USER');
$password = getenv('DB_PASSWORD');

$conn = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");

if (!$conn) {
    die("Connection failed: " . pg_last_error());
}

$query = $_POST['query'];

$sql = $query;
$result = pg_query($conn, $sql);

if ($result) {
    $rows = pg_fetch_all($result);
    echo json_encode($rows);
} else {
    echo json_encode(['error' => 'No results found']);
}

pg_close($conn);
?>
