const wdk = require('wikibase-sdk');
const axios = require('axios');

const wbk = wdk({
  instance: 'https://www.wikidata.org',
  sparqlEndpoint: 'https://query.wikidata.org/sparql',
});

const propertyMap = {};
const entityMap = {};

// WIkisearch Function
async function wikiSearch(wikiWord, lang = 'en', format = 'json', limit = 8) {
  let searchResults = null;

  if (wikiWord) {
    const searchUrl = wbk.searchEntities({
      search: wikiWord,
      lang,
      limit,
      format,
    });

    const response = await axios.get(searchUrl);
    searchResults = response.data;
  }
  return searchResults || 'The searched entity could not be found.';
}

// Lbel extractions 

async function labelExtractionProperty(idz) {
  const urls = wbk.getManyEntities({
      ids: idz,
      languages: ['en'], // returns all languages if not specified
      props: ['labels'], // returns all data if not specified
      format: 'json', // defaults to json
      redirections: false, // defaults to true
  });
  
  for(url of urls) {
    // url.forEach(async (urlEach) => { // TODO convert to async forEach @pkk
    const response = await axios.get(url);
    // Insert to entityMap
    for(pid in response.data.entities) {
      propertyMap[pid] = {
        type: response.data.entities[pid].type,
        id: response.data.entities[pid].id,
        label: response.data.entities[pid].labels.en?.value || 'No Label',
      }
    }
  // });
  }
  
  
  return propertyMap;
}

async function labelExtractionEntity(idz) {
  const urls = wbk.getManyEntities({
      ids: idz,
      languages: ['en'], // returns all languages if not specified
      props: ['labels'], // returns all data if not specified
      format: 'json', // defaults to json
      redirections: false, // defaults to true
  });
  for(url of urls) {
    // url.forEach(async (urlEach) => { // TODO convert to async forEach @pkk
    const response = await axios.get(url);
    // Insert to entityMap
    for(qid in response.data.entities) {
      entityMap[qid] = {
        type: response.data.entities[qid].type,
        id: response.data.entities[qid].id,
        label: response.data.entities[qid].labels?.en?.value || 'No Label',
      }
    }
  // });
  }
  return entityMap;
}

// Raw form of claims
async function claimsFetch(id) {
  const url = wbk.getEntities({
      ids: [id],
      languages: ['en'], // returns all languages if not specified
      props: ['claims', 'labels'], // returns all data if not specified
      format: 'json', // defaults to json
      redirections: false, // defaults to true
      limit: 50,
  });
  // console.log(url)
  const response = await axios.get(url);
  const entity = response.data.entities[id];
  const simplifiedClaims = wbk.simplify.claims(entity.claims);

  return simplifiedClaims;
}

async function labelsFetch(id) {
  const url = wbk.getEntities({
      ids: [id],
      languages: ['en'], // returns all languages if not specified
      props: ['descriptions', 'labels'], // returns all data if not specified
      format: 'json', // defaults to json
      redirections: false, // defaults to true
      limit: 50,
  });
  // console.log(url)
  const response = await axios.get(url);
  const entity = response.data.entities[id];
  const simplifiedLabels = wbk.simplify.labels(entity.labels)?.en || 'No Label';
  const simplifiedDescriptions = wbk.simplify.descriptions(entity.descriptions)?.en || 'No Description';
  const details = { labels: simplifiedLabels, descriptions: simplifiedDescriptions};
  return details;
}

// Run this to map data 
async function mapValue(simplifiedClaims) {
    // Property Map:
    const propertyOnlyArray = [];
    for(item in simplifiedClaims) {
      propertyOnlyArray.push(item);
    }
    await labelExtractionProperty(propertyOnlyArray);
    // console.log(propertyMap);
  
    // Entity Map:
    const entityOnlyArray = [];
    for(item in simplifiedClaims) {
      const itemValue = simplifiedClaims[item]
      if (typeof itemValue[0] === 'string' && itemValue[0].startsWith('Q') && itemValue.length === 1) {
        entityOnlyArray.push(itemValue);
      } else if (itemValue.length > 1) {
        itemValue.forEach(item => {
          if (typeof item === 'string' && item.startsWith('Q')) {
            entityOnlyArray.push(item);
          }
        })
      }
    }
    await labelExtractionEntity(entityOnlyArray);
    // console.log(entityMap);
}


module.exports = async(searchWordObject) => {
    // search on specific keyword
    let result = null;

    async function callMyWiki(search_qid) {
      let entityPropertiesData = await claimsFetch(search_qid);
      // Now Map data to fill id with labels
      await mapValue(entityPropertiesData);
      // Here is your property Map and Entity Map Ready
        // console.log(propertyMap);
        // console.log(entityMap);
      const final_value = {}
      for(item in entityPropertiesData) {
        // entityPropertiesData[item]['label'] = propertyMap[item]?.label || 'No English Label';
        final_value[item] = {
          label: propertyMap[item]?.label || 'No English Label',
          value: !String(entityPropertiesData[item][0])
                  .startsWith('Q') ? 
                    { 
                      value: entityPropertiesData[item][0],
                      type: 'text'
                    }
                    : {value: entityPropertiesData[item]
                      .map(item => {
                        return { 
                          qid:item,
                          value:entityMap[item]?.label || 'No English Value', 
                        }
                      }),
                      type: 'entity'
                    },
        }
      }
      const details = await labelsFetch(search_qid);
      // console.log(labels);
      final_value.name = details.labels;
      final_value.description = details.descriptions;
      // working
      //run
      // End Experiment
      return final_value;
    }

    if(searchWordObject.type === 'word') {
      const searchWord = searchWordObject.word;
      const searchedResponse = await wikiSearch(searchWord);
      // catch first element of search QID
      const searchid = searchedResponse.search[0].id;
      result = await callMyWiki(searchid)
    } if (searchWordObject.type === 'entity') {
      const searchid = searchWordObject.qid;
      result = await callMyWiki(searchid);
    }

    // Get raw form of data in P[id] from claims fetch
    return result;
}


// enityDetail('Q1058').then(res=>{
//     console.log(res);
// });

// wikiSearch('Naruto').then((res) => {
//   // eslint-disable-next-line
//   console.log(res.search[0].id);
//   console.log(`------------------------------`);
// //   enityDetail(res.search[0].id).then(ress => {
// //     console.log(ress.entities[res.search[0].id].claims.P31[0].mainsnak.datavalue.value.id);
// //   })
//    const final_data = []
//    entityProperties(res.search[0].id).then(res => {
//        for(const key in res) {
//            const data = {
//                pid: key,
//                pLabel: idToLabel(key),
//            };
//            final_data.push(data);
//        }
//        console.log(final_data);
//    })
// });

