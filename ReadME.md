# Wikibase SDK Exploration:

**Descritpion**: Fetch all the information of a particular entity e.g Property and Values.

Here I filtered information to fetch these relevant data of a respective entity or property....

There are two api point that I created to fetch data from wikibase[Wikidata]

## How to use this API

**Root API Endpoint**: `/api/wiki`

---

### Fetch Inforamtion by using Word:

```
{
   method: 'GET',
   route: 'api/wiki',
   params: {
       word: 'your_word',
       type: 'word'
   }
}
```

### Fetch Inforamtion by using QID of an Entity:

```
{
   method: 'GET',
   route: 'api/wiki',
   params: {
       qid: 'QID',
       type: 'entity'
   }
}
```
### [SEE DEMO](https://wikidata-api.netlify.app/)

![image](https://user-images.githubusercontent.com/49122753/129407744-23df9374-3959-4d46-bc81-6d151a1927da.png)

---
