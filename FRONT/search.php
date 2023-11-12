<?php

$host = process.env.HOST;
$port = process.env.PORT;
$dbname = process.env.DB_NAME;
$user = process.env.DB_USER;
$password = process.env.DB_PASSWORD;

$conn = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");

if (!$conn) {
    die("Connection failed: " . pg_last_error());
}

$query = $_POST['query'];

$sql = "SELECT * FROM your_table WHERE column_name ILIKE '%$query%'";
$result = pg_query($conn, $sql);

if ($result) {
    while ($row = pg_fetch_assoc($result)) {
        echo "ID: " . $row["id"] . " - Name: " . $row["name"] . "<br>";
    }
} else {
    echo "No results found";
}

pg_close($conn);
?>
