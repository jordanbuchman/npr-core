<template>
  <div class="flex min-h-screen flex-col">
    <main class="flex-1">
      <slot />
    </main>
    <footer class="px-4 py-8 text-center text-sm text-muted">
      <p class="mx-auto max-w-2xl">
        <strong>How NPRcore are you?</strong> was made with
        <UIcon name="i-lucide-music" class="align-middle" /> by
        <ULink to="https://github.com/jordanbuchman" target="_blank">Jordan Buchman</ULink> and
        <ULink to="https://samlowe.dev" target="_blank">Samuel Lowe</ULink>. The
        <ULink to="https://github.com/jordanbuchman/npr-core" target="_blank">source code</ULink>
        is licensed
        <ULink to="https://opensource.org/licenses/GPL-3.0" target="_blank">GPLv3</ULink>. NPR and
        the NPR logo are property of
        <ULink to="https://npr.org" target="_blank">National Public Radio, Inc.</ULink>
      </p>
    </footer>
  </div>
</template>
