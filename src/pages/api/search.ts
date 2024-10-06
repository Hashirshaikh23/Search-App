import { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
})

const customsearch = google.customsearch('v1')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { term } = req.query

  if (!term || typeof term !== 'string') {
    return res.status(400).json({ error: 'Search term is required' })
  }

  try {
    const youtubeResults = await searchYouTube(term)
    const webResults = await searchWeb(term)
    const combinedResults = [...youtubeResults, ...webResults]
    const rankedResults = rankResults(combinedResults)

    res.status(200).json(rankedResults)
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'An error occurred while searching' })
  }
}

async function searchYouTube(term: string) {
  const response = await youtube.search.list({
    part: ['snippet'],
    q: term,
    type: ['video'], 
    maxResults: 10,
  })

  return response.data.items?.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    type: 'youtube',
    views: 0,
    likes: 0,
    relevance: 0,
  })) || []
}

async function searchWeb(term: string) {
  const response = await customsearch.cse.list({
    q: term,
    cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
    auth: process.env.GOOGLE_API_KEY,
    num: 10,
  })

  return response.data.items?.map((item: any) => ({
    id: item.cacheId,
    title: item.title,
    description: item.snippet,
    link: item.link,
    type: determineContentType(item),
    relevance: 0,
  })) || []
}

function determineContentType(item: any) {
  if (item.link.includes('scholar.google.com') || item.link.includes('.edu')) {
    return 'academic'
  } else if (item.pagemap?.metatags?.[0]?.['og:type'] === 'article') {
    return 'article'
  } else {
    return 'blog'
  }
}

function rankResults(results: any[]) {
  return results.map(result => {
    let score = 0
    if (result.type === 'youtube') {
      score += (result.views || 0) * 0.0001 + (result.likes || 0) * 0.001
    }
    result.relevance = score
    return result
  }).sort((a, b) => b.relevance - a.relevance)
}