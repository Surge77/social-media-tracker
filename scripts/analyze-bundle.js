#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Simple bundle analyzer for Next.js builds
 * Analyzes the .next/static/chunks directory to understand bundle sizes
 */

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundle() {
  const buildDir = path.join(process.cwd(), '.next');
  const chunksDir = path.join(buildDir, 'static', 'chunks');
  
  if (!fs.existsSync(chunksDir)) {
    console.error('Build directory not found. Please run "npm run build" first.');
    process.exit(1);
  }

  console.log('📊 Bundle Analysis Report');
  console.log('========================\n');

  // Analyze chunks
  const chunks = [];
  const files = fs.readdirSync(chunksDir, { withFileTypes: true });
  
  files.forEach(file => {
    if (file.isFile() && file.name.endsWith('.js')) {
      const filePath = path.join(chunksDir, file.name);
      const stats = fs.statSync(filePath);
      chunks.push({
        name: file.name,
        size: stats.size,
        type: getChunkType(file.name)
      });
    }
  });

  // Sort by size (largest first)
  chunks.sort((a, b) => b.size - a.size);

  // Group by type
  const grouped = chunks.reduce((acc, chunk) => {
    if (!acc[chunk.type]) acc[chunk.type] = [];
    acc[chunk.type].push(chunk);
    return acc;
  }, {});

  // Display results
  Object.entries(grouped).forEach(([type, typeChunks]) => {
    console.log(`\n🔹 ${type.toUpperCase()} CHUNKS:`);
    console.log('-'.repeat(50));
    
    let totalSize = 0;
    typeChunks.forEach(chunk => {
      console.log(`  ${chunk.name.padEnd(40)} ${formatBytes(chunk.size).padStart(10)}`);
      totalSize += chunk.size;
    });
    
    console.log('-'.repeat(50));
    console.log(`  Total ${type}:`.padEnd(40) + formatBytes(totalSize).padStart(10));
  });

  // Overall summary
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  console.log('\n📈 SUMMARY:');
  console.log('==========');
  console.log(`Total chunks: ${chunks.length}`);
  console.log(`Total size: ${formatBytes(totalSize)}`);
  
  // Performance recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('==================');
  
  const largeChunks = chunks.filter(chunk => chunk.size > 100 * 1024); // > 100KB
  if (largeChunks.length > 0) {
    console.log('⚠️  Large chunks detected (>100KB):');
    largeChunks.forEach(chunk => {
      console.log(`   - ${chunk.name}: ${formatBytes(chunk.size)}`);
    });
    console.log('   Consider code splitting or lazy loading for these chunks.\n');
  }

  const mainChunk = chunks.find(chunk => chunk.name.includes('main'));
  if (mainChunk && mainChunk.size > 200 * 1024) { // > 200KB
    console.log('⚠️  Main bundle is large (>200KB)');
    console.log('   Consider moving heavy dependencies to separate chunks.\n');
  }

  console.log('✅ Analysis complete!');
}

function getChunkType(filename) {
  if (filename.includes('main')) return 'main';
  if (filename.includes('webpack')) return 'webpack';
  if (filename.includes('framework')) return 'framework';
  if (filename.includes('commons')) return 'commons';
  if (filename.includes('vendors')) return 'vendors';
  if (filename.includes('ui-components')) return 'ui';
  if (filename.includes('feed-components')) return 'feed';
  if (filename.match(/^pages-/)) return 'pages';
  if (filename.match(/^\d+/)) return 'dynamic';
  return 'other';
}

// Run the analyzer
analyzeBundle();