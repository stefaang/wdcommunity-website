// Server API makes it possible to hook into various parts of Gridsome
// on server-side and add custom data to the GraphQL data layer.
// Learn more: https://gridsome.org/docs/server-api/

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`
const axios = require('axios')

module.exports = function (api) {

    api.loadSource(async (actions) => {
        // Fetch data from APIs
        // see https://bintray.com/docs/api/#_packages
        const repoUrl = 'https://api.bintray.com/repos/tfl/wdpksrc'
        const getPackages = async (start_pos = 0) => {
            const query = `${repoUrl}/packages?start_pos=${start_pos}`
            const response = await axios.get(query)
            const data = response.data

            if (data.length === 50) {
                return data.concat(await getPackages(start_pos + 50))
            } else {
                return data
            }
        }
        //const { data } = await getPackages()
        const {data} = await axios.get(`${repoUrl}/packages`)

        // This only has the package names, so now we fetch more info about each package
        const packageUrl = 'https://api.bintray.com/packages/tfl/wdpksrc'

        //let versions = await Promise.all(
        //    data.map(pkg => axios.get(`${packageUrl}/${pkg.name}/versions/_latest`).then(resp => resp.data))
        //)

        let packageData = await Promise.all(
            data.map(pkg => axios.get(`${packageUrl}/${pkg.name}`).then(resp => resp.data))
        )
        //console.log(packageData[0])

        let fileData = await Promise.all(
            packageData
                .filter(pkg => pkg.latest_version)
                .map(pkg => axios.get(`${packageUrl}/${pkg.name}/versions/${pkg.latest_version}/files`)
                    .then(resp => resp.data))
        )
        //console.log(fileData[0])

        // Create a new GraphQL Collection
        const packages = actions.addCollection('BtPackage')
        // Add data to the new collection
        for (const pkg of packageData) {
            packages.addNode({
                id: pkg.name.toLowerCase(),
                name: pkg.name,
                repo: pkg.repo,
                owner: pkg.owner,
                desc: pkg.desc,
                labels: pkg.labels,
                licenses: pkg.licenses,
                created: pkg.created,
                website_url: pkg.website_url,
                issue_tracker_url: pkg.issue_tracker_url,
                linked_to_repos: pkg.linked_to_repos,
                permissions: pkg.permissions,
                latest_version: pkg.latest_version,
                updated: pkg.updated,
                rating_count: pkg.rating_count,
                system_ids: pkg.system_ids,
                vcs_url: pkg.vcs_url,
                maturity: pkg.maturity,
                icon: "" ,
            })
        }
        const files = actions.addCollection('BtFile')
        files.addReference('package', 'BtPackage')

        // Add file data to the file collection
        for (const versionFiles of fileData) {
            versionFiles.map(file => files.addNode({
                id: file.name,
                name: file.name,
                file_path: file.path,
                platform: file.name.split('_').slice(-1)[0].split('.')[0],
                repo: file.repo,
                pkg: file.package,
                version: file.version,
                owner: file.owner,
                created: file.created,
                size: file.size,
                sha1: file.sha1,
                sha256: file.sha256
            }))
        }
        console.info("Done loading Bintray data")
    })

    api.createPages(async ({graphql, createPage}) => {
        const {data} = await graphql(`{
                  packages: allBtPackage {
                    edges {
                      node {
                        id
                        name
                        desc
                        latest_version
                      }
                    }
                  }
                  # (filter: {pkg: $id})
                  files: allBtFile {
                    edges{
                      node {
                        name
                        file_path
                        pkg
                        platform
                      }
                    }
                  }
                }`)
        data.packages.edges.forEach(({node}) => {
            createPage({
                path: `/pkg/${node.id}`,
                component: './src/templates/Package.vue',
                context: {
                    id: node.id,
                    name: node.name,
                    desc: node.desc,
                    latest_version: node.latest_version,
                    files: data.files.edges.map(edge => edge.node).filter(f =>
                        f.pkg === node.name
                    ),
                    base_url: "https://dl.bintray.com/tfl/wdpksrc/",
                }
            })
        })
        //console.info(data.files.edges.map(edge => edge.node).filter(node => node.pkg === "Docker"))
    })


    api.createManagedPages(async ({createPage}) => {
        // const {data} = await axios.get('https://api.example.com/posts')

        // data.forEach(item => {
        //     createPage({
        //         path: `/pkg/${item.slug}`,
        //         component: './src/templates/Package.vue',
        //         context: {
        //             name: item.name,
        //             content: item.content
        //         }
        //     })
        // })
    })
}

