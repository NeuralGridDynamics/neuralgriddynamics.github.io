<?php
/**
 * Neural Grid Dynamics - Secure Admin Backend Control Panel (PHP)
 */
session_start();

$dataPath = __DIR__ . '/../data.json';
if (!file_exists($dataPath)) {
    header('Location: ../index.php');
    exit;
}

$data = json_decode(file_get_contents($dataPath), true);

// Default PHP credentials (admin / NeuralGrid2026!)
$adminUsername = "admin";
$adminPasswordHash = password_hash("NeuralGrid2026!", PASSWORD_BCRYPT);

$error = '';
$success = '';

// Handle Login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    $user = trim($_POST['username'] ?? '');
    $pass = $_POST['password'] ?? '';

    if ($user === $adminUsername && password_verify($pass, $adminPasswordHash)) {
        $_SESSION['admin_auth'] = true;
        $_SESSION['admin_user'] = $user;
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    } else {
        $error = "Invalid administrative credentials. Access attempt logged.";
    }
}

// Handle Logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    session_destroy();
    header('Location: index.php');
    exit;
}

// Handle Admin Actions
if (!empty($_SESSION['admin_auth']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        die("CSRF Security Validation Failed.");
    }

    if (isset($_POST['action']) && $_POST['action'] === 'add_project') {
        $newProj = [
            "id" => "proj-" . time(),
            "title" => htmlspecialchars(trim($_POST['title'])),
            "clientName" => htmlspecialchars(trim($_POST['clientName'])),
            "category" => htmlspecialchars(trim($_POST['category'])),
            "description" => htmlspecialchars(trim($_POST['description'])),
            "impactMetrics" => htmlspecialchars(trim($_POST['impactMetrics'])),
            "published" => true
        ];
        $data['projects'][] = $newProj;
        file_put_contents($dataPath, json_encode($data, JSON_PRETTY_PRINT));
        $success = "Project added successfully.";
    }
}

$isLoggedIn = !empty($_SESSION['admin_auth']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neural Grid Admin Control Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body class="bg-gray-950 text-gray-100 font-sans min-h-screen flex flex-col justify-between">
    <nav class="border-b border-gray-800 bg-gray-900 px-6 py-4 flex justify-between items-center">
        <div class="flex items-center space-x-2">
            <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-bold text-white tracking-wide">Neural Grid Admin</span>
        </div>
        <?php if ($isLoggedIn): ?>
            <div class="flex items-center space-x-4">
                <span class="text-xs text-gray-400">Authenticated: <strong><?php echo htmlspecialchars($_SESSION['admin_user']); ?></strong></span>
                <a href="?action=logout" class="text-xs text-red-400 hover:underline">Logout</a>
            </div>
        <?php endif; ?>
    </nav>

    <div class="max-w-4xl mx-auto w-full p-6 my-auto">
        <?php if (!$isLoggedIn): ?>
            <div class="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-md mx-auto shadow-2xl">
                <h2 class="text-xl font-bold text-white mb-1">Admin Portal Access</h2>
                <p class="text-xs text-gray-400 mb-6">Restricted to authorized system administrators only.</p>

                <?php if ($error): ?>
                    <div class="p-3 mb-4 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                        <?php echo $error; ?>
                    </div>
                <?php endif; ?>

                <form method="POST" class="space-y-4">
                    <input type="hidden" name="action" value="login">
                    <div>
                        <label class="block text-xs font-semibold text-gray-400 mb-1">Username</label>
                        <input type="text" name="username" required class="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-gray-400 mb-1">Master Password</label>
                        <input type="password" name="password" required class="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                    </div>
                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded text-sm transition">Authenticate</button>
                </form>
            </div>
        <?php else: ?>
            <div class="space-y-6">
                <?php if ($success): ?>
                    <div class="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                        <?php echo $success; ?>
                    </div>
                <?php endif; ?>

                <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 class="text-lg font-bold text-white mb-4">Add New Case Study Project</h2>
                    <form method="POST" class="space-y-4">
                        <input type="hidden" name="action" value="add_project">
                        <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs text-gray-400 mb-1">Project Title</label>
                                <input type="text" name="title" required class="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm text-white">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400 mb-1">Client Name</label>
                                <input type="text" name="clientName" required class="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm text-white">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs text-gray-400 mb-1">Category</label>
                                <select name="category" class="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm text-white">
                                    <option>Generative AI</option>
                                    <option>Enterprise LLMs</option>
                                    <option>Computer Vision</option>
                                    <option>FinTech AI</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400 mb-1">Impact Metrics</label>
                                <input type="text" name="impactMetrics" placeholder="e.g. 99% Precision • $2M Savings" class="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm text-white">
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs text-gray-400 mb-1">Description</label>
                            <textarea name="description" rows="3" required class="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm text-white"></textarea>
                        </div>

                        <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded">Save Project</button>
                    </form>
                </div>
            </div>
        <?php endif; ?>
    </div>

    <footer class="border-t border-gray-900 bg-gray-950 py-4 text-center text-xs text-gray-600">
        Neural Grid Control Panel &bull; PHP Backend Engine
    </footer>
</body>
</html>
