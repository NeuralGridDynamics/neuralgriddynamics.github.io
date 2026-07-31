<?php
/**
 * Neural Grid Dynamics - Enterprise AI Software House
 * Public Portal (PHP Production Version)
 */
session_start();

$dataPath = __DIR__ . '/data.json';
if (!file_exists($dataPath)) {
    $initialData = [
        "siteConfig" => [
            "companyName" => "Neural Grid Dynamics",
            "tagline" => "Enterprise AI Engineering & Autonomous Grid Intelligence",
            "heroHeadline" => "Architecting Enterprise AI Systems & Autonomous Neural Networks",
            "heroSubhead" => "Neural Grid Dynamics delivers production-ready Generative AI platforms, bespoke Large Language Models, Computer Vision pipelines, and MLOps cloud infrastructure for world-leading enterprises.",
            "contactEmail" => "solutions@neuralgrid.ai",
            "contactPhone" => "+1 (888) 902-GRID",
            "address" => "750 Innovation Parkway, San Jose, CA"
        ],
        "projects" => [
            [
                "id" => "proj-1",
                "title" => "Autonomous Multi-Agent FinTech Fraud Detection Grid",
                "clientName" => "Global Capital Financial",
                "category" => "FinTech AI",
                "description" => "Real-time transaction analysis processing 80,000 requests/sec with neural anomaly detection.",
                "impactMetrics" => "99.94% Precision • 12ms Latency • $14.2M Quarterly Savings",
                "imageUrl" => "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
                "published" => true
            ],
            [
                "id" => "proj-2",
                "title" => "Enterprise On-Premise LLM & Knowledge Graph",
                "clientName" => "AeroDynamics Aerospace Corp",
                "category" => "Enterprise LLMs",
                "description" => "Air-gapped secure Generative AI search and automated technical compliance engine indexing 15M blueprints.",
                "impactMetrics" => "75% Faster Audits • 15M Documents Indexed",
                "imageUrl" => "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",
                "published" => true
            ]
        ],
        "clients" => [
            ["name" => "Global Capital Financial", "industry" => "Banking Tech"],
            ["name" => "AeroDynamics Aerospace", "industry" => "Defense & Space"],
            ["name" => "NetSol Auto Systems", "industry" => "Automotive Robotics"]
        ]
    ];
    file_put_contents($dataPath, json_encode($initialData, JSON_PRETTY_PRINT));
}

$data = json_decode(file_get_contents($dataPath), true);
$site = $data['siteConfig'];
$projects = array_filter($data['projects'], function($p) { return !empty($p['published']); });
$clients = $data['clients'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($site['companyName']); ?> - AI Software House</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #030712; color: #f3f4f6; }
        .grid-bg { background-image: radial-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px); background-size: 32px 32px; }
        .glow-border { border: 1px solid rgba(59, 130, 246, 0.2); box-shadow: 0 0 20px rgba(59, 130, 246, 0.1); }
    </style>
</head>
<body class="grid-bg min-h-screen flex flex-col">
    <!-- Navigation -->
    <nav class="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xl text-white">NG</div>
                <span class="text-xl font-bold tracking-tight text-white"><?php echo htmlspecialchars($site['companyName']); ?></span>
            </div>
            <div class="hidden md:flex space-x-8 text-sm font-medium text-gray-300">
                <a href="#services" class="hover:text-blue-400 transition">Solutions</a>
                <a href="#projects" class="hover:text-blue-400 transition">Projects</a>
                <a href="#clients" class="hover:text-blue-400 transition">Clients</a>
                <a href="#contact" class="hover:text-blue-400 transition">Contact</a>
            </div>
            <a href="admin/index.php" class="px-4 py-2 text-xs font-semibold rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition">Admin Portal</a>
        </div>
    </nav>

    <!-- Hero -->
    <header class="max-w-7xl mx-auto px-6 py-20 text-center relative">
        <span class="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-block mb-4">Enterprise AI Systems & Engineering</span>
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight mb-6">
            <?php echo htmlspecialchars($site['heroHeadline']); ?>
        </h1>
        <p class="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            <?php echo htmlspecialchars($site['heroSubhead']); ?>
        </p>
        <div class="flex justify-center space-x-4">
            <a href="#contact" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-blue-500/20 transition">Schedule Consultation</a>
            <a href="#projects" class="px-6 py-3 bg-gray-900 border border-gray-800 text-gray-300 hover:text-white font-medium text-sm rounded-lg transition">View Case Studies</a>
        </div>
    </header>

    <!-- Projects -->
    <section id="projects" class="max-w-7xl mx-auto px-6 py-16 w-full">
        <h2 class="text-2xl font-bold text-white mb-2">Enterprise Projects & Case Studies</h2>
        <p class="text-gray-400 text-sm mb-8">Deployments in production for Fortune 500 and global government bodies.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <?php foreach ($projects as $proj): ?>
                <div class="bg-gray-900/60 rounded-xl glow-border p-6 flex flex-col justify-between">
                    <div>
                        <span class="text-xs font-semibold text-blue-400 uppercase tracking-wider"><?php echo htmlspecialchars($proj['category']); ?></span>
                        <h3 class="text-xl font-bold text-white mt-1 mb-2"><?php echo htmlspecialchars($proj['title']); ?></h3>
                        <p class="text-sm text-gray-400 mb-4"><?php echo htmlspecialchars($proj['description']); ?></p>
                        <div class="bg-blue-950/40 border border-blue-800/30 rounded p-3 text-xs text-blue-300 font-mono mb-4">
                            <?php echo htmlspecialchars($proj['impactMetrics']); ?>
                        </div>
                    </div>
                    <div class="text-xs text-gray-500 flex justify-between items-center pt-2 border-t border-gray-800">
                        <span>Client: <?php echo htmlspecialchars($proj['clientName']); ?></span>
                        <span class="text-blue-400">Verified Deployment &rarr;</span>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </section>

    <!-- Footer -->
    <footer class="mt-auto border-t border-gray-800 bg-gray-950 py-8 px-6 text-center text-xs text-gray-500">
        &copy; <?php echo date('Y'); ?> <?php echo htmlspecialchars($site['companyName']); ?>. All Rights Reserved. Air-Gapped Enterprise AI Security Verified.
    </footer>
</body>
</html>
