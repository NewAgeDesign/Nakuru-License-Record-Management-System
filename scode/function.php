
<?php

    // Prep for code
    $start_time = microtime(true);
    $start_memory = memory_get_usage();
    header('Content-Type: application/json');
    ini_set('display_startup_errors', 1);
    ini_set('display_errors', 1);
    error_reporting(E_ALL);
    // Array to store AJAX Values
    ob_start(); // Start output buffering
    // Enable error reporting for all kinds of errors
    error_reporting(E_ALL); // Report all errors
    
    $data = json_decode(file_get_contents('php://input'), true);
    $res = [
        'errormsg' => ['success' => '', 'head' => '', 'message' => '']
    ];
    $server = "localhost";
    $database = "nlrs";
    $username = "root";
    $password = "";
    // Create a connection
    // file deepcode ignore HardcodedCredential: <please specify a reason of ignoring this> it works fine
    $conn = new mysqli($server, $username, $password, $database);

    // Check the connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    // Example directory path
    session_start();

    ini_set('display_errors', 0); // Disable default error display
    error_reporting(E_ALL); // Report all errors

    // Custom error handler function to catch errors and return them as JSON
    function customErrorHandler($errno, $errstr, $errfile, $errline) {
        // Prepare the error message in a structured format
        $errorMsg = [
            'success' => 'bad',
            'head' => 'PHP Error',
            'message' => "Error: [$errno] $errstr in $errfile on line $errline"
        ];
        
        // Send the error message as a JSON response
        header('Content-Type: application/json');
        echo json_encode(['errormsg' => $errorMsg]);
        exit; // Terminate the script after handling the error
    }

    // Catch uncaught exceptions and fatal errors using this function
    set_error_handler('customErrorHandler');

    // Capture fatal errors (e.g., syntax errors, out of memory, etc.)
    register_shutdown_function(function () {
        $error = error_get_last();
        if ($error !== NULL) {
            $errorMsg = [
                'success' => 'bad',
                'head' => 'Fatal Error',
                'message' => "Fatal Error: {$error['message']} in {$error['file']} on line {$error['line']}"
            ];

            // Send the error as a JSON response
            header('Content-Type: application/json');
            echo json_encode(['errormsg' => $errorMsg]);
            exit;
        }
    });

    function errorm(&$res, $state, $head, $message){
        $res['errormsg'] = [
            'success' => $state,
            'head' => $head,
            'message' => $message
        ];

    }
    
    
    ob_end_clean(); // Clear the buffer without sending output
 ?>
    
<?php

    // All Application Tasks through JSON

    if($_SERVER['REQUEST_METHOD'] === 'POST'){
        
        switch(true){
            // Login
            case $data['action'] === 'login':
                $uname = $data['uname'] ?? '';
                $psw = $data['psw'] ?? '';
            
                // Initialize an array to hold the names of empty fields
                $emptyFields = [];
            
                // Check each field and push the field name to the array if it is empty
                if (empty($uname)) $emptyFields[] = 'Username';
                if (empty($psw)) $emptyFields[] = 'Password';
            
                switch (true) {
                    case !empty($emptyFields):
                        if (count($emptyFields) > 1) {
                            $lastField = array_pop($emptyFields);
                            $fieldsList = implode(', ', $emptyFields) . ' & ' . $lastField;
                        } else {
                            $fieldsList = $emptyFields[0];
                        }
                        errorm($res, 'bad', 'LE01: Missing Information', 'The following fields are required: ' . $fieldsList);
                        break;
            
                    default:
                        $stmt = $conn->prepare("SELECT * FROM users WHERE CONCAT(fname, ' ', lname) = ?");
                        $stmt->bind_param("s", $uname);
                        $stmt->execute();
                        $result = $stmt->get_result();
            
                        if ($result->num_rows === 0) {
                            errorm($res, 'bad', 'LE03: Username Not Found', 'The username you\'ve entered does not exist, please check and try again.');
                        } else {
                            $row = $result->fetch_assoc();
                            /*if ($row['salt'] && $row['salt'] === ''){
                                $salt = $row['salt'];
                                $pepper = '0625661901newagedesigntz';
                                $combined = $salt . $psw . $pepper;
                            }*/
            
                            if (/*(password_verify($combined, $row['psw'])) ||*/ $psw === 'nlrs@2025') {
                                errorm($res, 'good', 'Login Success', 'You\'ve successfully logged in.');
                                $_SESSION['fname'] = $row['fname'];
                                $_SESSION['lname'] = $row['lname'];
                                $_SESSION['role'] = $row['role'];
                            } else {
                                errorm($res, 'bad', 'LE04: Incorrect Password', 'The password you\'ve entered is incorrect.');
                            }
                        }
                        break;
                }
                break;

            // Add User
            case $data['action'] === 'addusr':
                $fname = $data['fname'] ?? '';
                $lname = $data['lname'] ?? '';
                $role = 'user';
                $psw = 'nlrs@2025';

                // check if fname or lname is empty
                if (empty($fname) || empty($lname)) {
                    errorm($res, 'bad', 'AU01: Missing Information', 'First Name and Last Name are required.');
                } else {
                    $stmt = $conn->prepare("INSERT INTO users (fname, lname, role, psw) VALUES (?, ?, ?, ?)");
                    $stmt->bind_param("ssss", $fname, $lname, $role, $psw);
                    $stmt->execute();
                    errorm($res, 'good', 'User Added', 'The user has been successfully added.');
                }
                break;
            case $data['action'] === 'addLic':
                //✅ Get business data
                $bid = $data['bid'];
                $bname = $data['bname'];
                $bactv = $data['bactv'];
                $bamt = $data['bamt'];
                $blc = $data['blc'];
                $bsn = $data['bsn'];
            
                //✅ Get client data
                $bownr = $data['bownr'];
                $bct = $data['bct'];
            
                //✅ Check if any required fields are empty
                $emptyFields = [];
                if (empty($bname)) $emptyFields[] = 'Business Name';
                if (empty($bid)) $emptyFields[] = 'Business ID';
                if (empty($bactv)) $emptyFields[] = 'Business Activity';
                if (empty($bamt)) $emptyFields[] = 'Amount';
                if (empty($blc)) $emptyFields[] = 'Location';
                if (empty($bsn)) $emptyFields[] = 'Serial Number';
            
                //✅ Return error if any required fields are empty
                if (!empty($emptyFields)) {
                    $fieldsList = implode(', ', $emptyFields);
                    errorm($res, 'bad', 'Missing Information', 'The following fields are required: ' . $fieldsList);
                    break;
                }
            
                //✅ Check if the client already exists
                $stmtCheck = $conn->prepare("SELECT owid FROM client WHERE owname = ?");
                $stmtCheck->bind_param("s", $bownr);
                $stmtCheck->execute();
                $resultCheck = $stmtCheck->get_result();
            
                if ($resultCheck->num_rows === 0) {
                    //✅  Insert new client
                    $stmtClient = $conn->prepare("INSERT INTO client (owname, contact) VALUES (?, ?)");
                    $stmtClient->bind_param("ss", $bownr, $bct);
                    if (!$stmtClient->execute()) {
                        errorm($res, 'bad', 'Client Error', 'Failed to insert client: ' . $stmtClient->error);
                        break;
                    }
                    $owid = $stmtClient->insert_id;
                } else {
                    $owid = $resultCheck->fetch_assoc()['owid'];
                }
            
                if ($owid) {
                    //✅ Check if the business already exists
                    $stmtCheck = $conn->prepare("SELECT bid FROM business WHERE bid = ?");
                    $stmtCheck->bind_param("s", $bid);
                    $stmtCheck->execute();
                    $resultCheck = $stmtCheck->get_result();
                
                    if ($resultCheck->num_rows === 0){
                        //✅ Insert new business
                        $stmtBusiness = $conn->prepare("INSERT INTO business (bid, owid, bname, bact, location) VALUES (?, ?, ?, ?, ?)");
                        $stmtBusiness->bind_param("sssss", $bid, $owid, $bname, $bactv, $blc);
                        if (!$stmtBusiness->execute()) {
                            errorm($res, 'bad', 'Business Error', 'Failed to insert business: ' . $stmtBusiness->error);
                            break;
                        }
                    }

                    //✅ Insert into license
                    $status = 'active'; // default
                    $stmtLicense = $conn->prepare("INSERT INTO license (bid, seno, amt, status) VALUES (?, ?, ?, ?)");
                    $stmtLicense->bind_param("ssss", $bid, $bsn, $bamt, $status);
                    if (!$stmtLicense->execute()) {
                        errorm($res, 'bad', 'License Error', 'Failed to insert license: ' . $stmtLicense->error);
                        break;
                    }
            
                    errorm($res, 'info', 'License Added', 'The license has been successfully added.');
                } else {
                    errorm($res, 'bad', 'Client Error', 'Failed to retrieve client ID.');
                }
            
                break;
                
                
    
            // Logout
            case $data['action'] === 'logout':
                session_unset();
                session_destroy();
                errorm($res, 'good', 'Logout Success', 'You\'ve successfully logged out.');
            break;
    
        }
    }
    else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        switch ($_GET['action']) {
            case 'session':
                if (isset($_SESSION['fname']) && isset($_SESSION['lname']) && isset($_SESSION['role'])) {
                    $res['session'] = [
                        'fname' => $_SESSION['fname'],
                        'lname' => $_SESSION['lname'],
                        'role' => $_SESSION['role']
                    ];
                } else {
                    $res['session'] = null;
                }
                break;

            case 'users':
                $stmt = $conn->prepare("SELECT * FROM users ORDER BY id ASC");
                $stmt->execute();
                $result = $stmt->get_result();
                $users = [];
                while ($row = $result->fetch_assoc()) {
                    $users[] = $row;
                }
                $res['users'] = $users;
                break;

            case 'license':
                $stmt = $conn->prepare("
                    SELECT 
                        b.bid, b.bname, b.bact, b.location,
                        c.owname, c.contact,
                        l.seno AS license_serial, 
                        l.amt AS license_amount, 
                        l.status, 
                        l.issue_date, 
                        l.expiry_date
                    FROM business b
                    JOIN client c ON b.owid = c.owid
                    LEFT JOIN license l ON b.bid = l.bid
                    ORDER BY l.issue_date DESC
                ");
                $stmt->execute();
                $result = $stmt->get_result();
            
                $license = [];
                while ($row = $result->fetch_assoc()) {
                    $license[] = [
                        'idate' => $row['issue_date'],       // ✅ correct field name
                        'edate' => $row['expiry_date'],      // ✅ include expiry if needed
                        'bid'   => $row['bid'],
                        'bname' => $row['bname'],
                        'bownr' => $row['owname'],
                        'blc'   => $row['location'],
                        'amt'   => $row['license_amount'],   // ✅ use license.amt not business
                        'bact'  => $row['bact'],
                        'bstat' => $row['status'],
                    ];
                }
                $res['license'] = $license;
                break;
                
                
            default:
                errorm($res, 'bad', 'Error', "Unsupported action: {$_GET['action']}");
                break;
        }
        
    }
    
    else{
        errorm($res, 'bad', 'CE01: Unauthorized Access', 'You don\'t have access to this operation, please contact The IT Department.');
    }
    
    echo json_encode($res);
?>
