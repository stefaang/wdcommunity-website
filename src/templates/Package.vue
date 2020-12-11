<template>
  <Layout>
    <h1>{{ $context.name }}</h1>
    <p>{{ $context.desc }}</p>
    <div v-for="f in $context.files" :key="f.name">
      <p><a :href="`${ $context.base_url }${ f.file_path }`"> {{ f.pkg }} for {{ f.platform }}</a></p>
    </div>
  </Layout>
</template>

