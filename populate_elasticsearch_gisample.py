from elasticsearch import Elasticsearch
import pickle

es = Elasticsearch()

# Load metadata.
meta = pickle.load(open('.\\ExtractedMetadata.pickle', 'rb'))

# Iterate over metadata and add to Elasticsearch DB.
for key, val in meta.items():

    if type(val['authors']) != type([]):
        val['authors'] = [{'LastName': val['authors']}]

    if type(val['abstract']) != type('string'):

        #TODO: check for 'BACKGROUND' label... maybe, not sure how to figure this one out.

        try:

            if type(val['abstract']) == type([]):
                val['abstract'] = val['abstract'][0]['#text']
            else:
                val['abstract'] = val['abstract']['#text']

        except:
            print('exception')
            val['abstract'] = 'Abstract not available.'

    if type(val['title']) != type('string'):

        if type(val['title']) == type(None):
            print(key)
            print('no title...')
            val['title'] = 'No title available.'
        else:
            val['title'] = val['title']['#text']

    # Map integers to strings.
    if val['cites'] != []:
        val['cites'] = [str(PMID) for PMID in val['cites']]

    if val['cited_by'] != []:
        val['cited_by'] = [str(PMID) for PMID in val['cited_by']]

    res = es.index(index='gisample', doc_type='paper', id=key, body=val)
    print(res)
