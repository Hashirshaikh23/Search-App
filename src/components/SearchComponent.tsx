import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FaYoutube, FaNewspaper, FaGraduationCap, FaFileAlt, FaThumbsUp, FaEye, FaExternalLinkAlt } from 'react-icons/fa'

type SearchResult = {
  id: string
  title: string
  link: string
  description: string
  type: 'youtube' | 'article' | 'academic' | 'blog'
  views?: number
  likes?: number
  relevance: number
}

export default function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?term=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error fetching search results:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredResults = activeTab === 'all' 
    ? results 
    : results.filter(result => result.type === activeTab)

  const getIcon = (type: string) => {
    switch (type) {
      case 'youtube': return <FaYoutube className="h-4 w-4" />
      case 'article': return <FaNewspaper className="h-4 w-4" />
      case 'academic': return <FaGraduationCap className="h-4 w-4" />
      case 'blog': return <FaFileAlt className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Advanced Search</h1>
      <div className="flex space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Enter search term"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
          <TabsTrigger value="article">Articles</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="blog">Blogs</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredResults.map((result) => (
            <Card key={result.id} className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getIcon(result.type)}
                  <span>{result.title}</span>
                </CardTitle>
                <CardDescription>{result.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {result.views && (
                      <Badge variant="secondary">
                        <FaEye className="h-4 w-4 mr-1" />
                        {result.views}
                      </Badge>
                    )}
                    {result.likes && (
                      <Badge variant="secondary">
                        <FaThumbsUp className="h-4 w-4 mr-1" />
                        {result.likes}
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      Relevance: {result.relevance.toFixed(2)}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={result.link} target="_blank" rel="noopener noreferrer">
                      <FaExternalLinkAlt className="h-4 w-4 mr-1" />
                      View
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}