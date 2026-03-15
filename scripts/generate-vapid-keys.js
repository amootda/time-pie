#!/usr/bin/env node

/**
 * VAPID 키 생성 스크립트
 * Usage: node scripts/generate-vapid-keys.js
 *
 * 생성된 키를 .env.local에 추가하세요:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
 *   VAPID_PRIVATE_KEY=...
 */

const path = require('path')
const webpush = require(path.resolve(__dirname, '../apps/web/node_modules/web-push'))

const vapidKeys = webpush.generateVAPIDKeys()

console.log('VAPID Keys Generated!\n')
console.log('Add these to your .env.local:\n')
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`)
