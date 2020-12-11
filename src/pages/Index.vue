<template>
  <Layout>

    <!-- Learn how to use images here: https://gridsome.org/docs/images -->
    <g-image alt="Example image" src="~/favicon.png" width="200"/>

    <p>
      We provide apps for Western Digital My Cloud OS5 NAS.
    </p>

    <flex>
      <figure v-for="edge in $page.packages.edges" :key="edge.node.id">
        <g-link :to="`/pkg/${edge.node.id}`">
          <img
              :src="`https://cdn.rawgit.com/WDCommunity/wdpksrc/master/wdpk/${edge.node.id}/web/${edge.node.id}.png`"
              :alt="`${edge.node.name}`"></img>
        </g-link>
        <figcaption>{{edge.node.name}}</figcaption>
      </figure>
    </flex>

    <p>
      Links
    </p>
    <p class="home-links">
      <a href="https://community.wd.com/" target="_blank" rel="noopener">Official WD community forum</a>
    </p>
    <p>
      <a href="https://github.com/WDCommunity/wdpksrc" target="_blank" rel="noopener">GitHub</a>
    </p>


  </Layout>
</template>

<page-query>
  query {
  packages: allBtPackage(filter: {labels: {contains: "OS5"}}) {
  edges {
  node {
  id
  name
  desc
  latest_version
  }
  }
  }
  }
</page-query>

<script>
  export default {
    metaInfo: {
      title: 'Home'
    }
  }
</script>

<style>
  .home-links a {
    margin-right: 1rem;
  }
</style>
