<template>
  <div class="site">
    <Nuxt class="site_content" />
    <footer style="padding-bottom: 3rem" class="footer">
      <div class="content has-text-centered">
        <p>
          <strong>How NPRcore are you?</strong> was made with <font-awesome-icon :icon="['fas', 'music']" /> by <a href="https://github.com/jordanbuchman">Jordan Buchman</a> and Sam Lowe. 
          The <a href="https://github.com/jordanbuchman/npr-core">source code</a> is licensed <a href="https://opensource.org/licenses/GPL-3.0">GPLv3</a>.
          NPR and the NPR logo are property of <a href="https://npr.org"> National Public Radio, Inc.</a>.
        </p>
      </div>
    </footer>
  </div>
</template>

<style>

.site {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.site_content {
  flex: 1;
}
/*
html {
  font-family:
    'Source Sans Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

.button--green {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #3b8070;
  color: #3b8070;
  text-decoration: none;
  padding: 10px 30px;
}

.button--green:hover {
  color: #fff;
  background-color: #3b8070;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}


.button--grey--active {
  color: #fff;
  background-color: #35495e;
}
*/

</style>
