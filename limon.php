<?php

//------------SETTINGS------------------
$apiKey = 'y7KmPF3F60kBS6jg9332ENPgVsCujURIvdVp2E6mNgerLMFquU9Ba2Wp7nJm8e';
$offer_id = 11787; // для каждого оффера свой айди, надо уточнять его в админке или у суппортов

//--------------------------------------
$apiUrl = 'http://api.cpa.tl/api/lead/send';
$thanks = 'success.php';
$pixel = $_POST['pixel'];

session_start();

$_SESSION['name'] = $_POST['name'];
$_SESSION['phone'] = $_POST['phone'];
$_SESSION['pixel'] = $_POST['pixel'];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data_post = $_POST;

    $data = array(
        'key' => $apiKey,
        'id' => $data_post['subid'],
        //microtime(true), // тут лучше вставить значение, по которому вы сможете идентифицировать свой лид; можно оставить microtime если у вас нет своей crm
        'offer_id' => $offer_id,
        'stream_hid' => $stream_hid,
        'name' => $data_post['name'],
        'phone' => $data_post['phone'],
        'comments' => isset($data_post['comments']) ? $data_post['comments'] : '',
        'country' => $data_post['country'], // формат ISO 3166-1 Alpha-2 - https://ru.wikipedia.org/wiki/ISO_3166-1
        'address' => isset($data_post['address']) ? $data_post['address'] : '' ,
        'tz' => $data_post['timezone_int'], // очень желательно получать его с ленда, но если никак лучше оставить пустым или 3 (таймзона мск)
        'sub1' => $data_post['sub1'], 
        'web_id' => $web_id,
        'ip_address' => isset($_SERVER["HTTP_CF_CONNECTING_IP"]) ? $_SERVER["HTTP_CF_CONNECTING_IP"] : $_SERVER['REMOTE_ADDR'],
        'user_agent' => $_SERVER['HTTP_USER_AGENT'],
    );

    $options = array(
        'http' => array(
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data),
            'ignore_errors' => true,
        )
    );

    $context = stream_context_create($options);
    $result = file_get_contents($apiUrl, false, $context);

    $obj = json_decode($result);

    if (null === $obj) {
        // Ошибка в полученном ответе
        print("Invalid JSON");
    } else if (!empty($obj->errmsg)) {
        // Ошибка в отправленном запросе
        print("Error: " . $оbj->errmsg);
    } else {
        header('Location:' . $thanks . '?id=' . $obj->id);
        // print('ID заявки: ' . $obj->id);
    }
}
