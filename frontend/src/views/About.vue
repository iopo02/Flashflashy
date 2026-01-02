<template>
  <div class="about">
    <h1>About Flashflashy</h1>
    <p>This is a MEVN stack application:</p>
    <ul>
      <li><strong>M</strong>ongoDB - Database</li>
      <li><strong>E</strong>xpress - Backend framework</li>
      <li><strong>V</strong>ue.js - Frontend framework</li>
      <li><strong>N</strong>ode.js - Runtime environment</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
};
</script>

<style scoped>
.about {
  padding: 20px;
  text-align: left;
  max-width: 600px;
  margin: 0 auto;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 10px 0;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
}
</style>

