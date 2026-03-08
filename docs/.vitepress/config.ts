import process from 'node:process';
import { defineConfig } from 'vitepress';

const repo = 'https://github.com/obsidianlabs-io/obsidian-admin-vue';
const backendRepo = 'https://github.com/obsidianlabs-io/obsidian-admin-laravel';

export default defineConfig({
  base: process.env.VITEPRESS_BASE || '/',
  title: 'Obsidian Admin Vue',
  description: 'Contract-driven Vue 3 admin frontend for enterprise back-office systems and SaaS platforms.',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,
  metaChunk: true,
  head: [['link', { rel: 'icon', href: '/favicon.svg' }]],
  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: 'Guide', link: '/getting-started' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'Compatibility', link: '/compatibility-matrix' },
      { text: 'GitHub', link: repo }
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Backend Pairing', link: '/backend-pairing' },
          { text: 'Full-Stack Evaluation', link: '/full-stack-evaluation' },
          { text: 'Demo', link: '/demo' },
          { text: 'Compatibility Matrix', link: '/compatibility-matrix' },
          { text: 'Configuration', link: '/configuration' },
          { text: 'Deployment', link: '/deployment' },
          { text: 'Testing', link: '/testing' },
          { text: 'Auth Flows', link: '/auth-flows' }
        ]
      },
      {
        text: 'Architecture',
        items: [
          { text: 'Frontend Architecture', link: '/architecture' },
          { text: 'Multi-Tenancy', link: '/multi-tenancy' },
          { text: 'Realtime', link: '/realtime' },
          { text: 'Generated SDK Workflow', link: '/generated-sdk-workflow' },
          { text: 'API Layer Conventions', link: '/api-layer-conventions' },
          { text: 'Deletion UI Guidelines', link: '/deletion-ui-guidelines' }
        ]
      },
      {
        text: 'Contracts & Releases',
        items: [
          {
            text: 'API Client Contract Snapshot',
            link: '/api-client-contract.snapshot'
          },
          {
            text: 'API Backend Compat Allowlist',
            link: '/api-backend-compat.allowlist.json'
          },
          { text: 'Release SOP', link: '/release-sop' },
          { text: 'Release Final Checklist', link: '/release-final-checklist' }
        ]
      },
      {
        text: 'GitHub Project Ops',
        items: [
          {
            text: 'Repository Setup Checklist',
            link: '/github/repository-setup-checklist'
          },
          { text: 'Repository Metadata', link: '/github/repository-metadata' }
        ]
      }
    ],
    socialLinks: [{ icon: 'github', link: repo }],
    editLink: {
      pattern: `${repo}/edit/main/docs/:path`,
      text: 'Edit this page on GitHub'
    },
    footer: {
      message: `Pair with <a href="${backendRepo}" target="_blank" rel="noreferrer">Obsidian Admin Laravel</a> for the full contract-driven stack.`,
      copyright: 'Released under the MIT License.'
    },
    search: {
      provider: 'local'
    },
    outline: {
      level: [2, 3]
    },
    docFooter: {
      prev: 'Previous page',
      next: 'Next page'
    }
  }
});
