import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHatEmbeddings } from "../hooks/useHatEmbeddings";
import { RefreshCw, Search, Database, AlertTriangle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const HatSimilarityVisualization = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("embeddings");
  const { 
    embeddings, 
    similarities, 
    stats,
    loading, 
    refreshing,
    refreshAllEmbeddings, 
    refreshHatEmbedding 
  } = useHatEmbeddings();

  // Filter embeddings based on search term
  const filteredEmbeddings = embeddings.filter(
    (embedding) => embedding.hat_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter similarities based on search term
  const filteredSimilarities = similarities.filter(
    (similarity) => 
      similarity.hat1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      similarity.hat2.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate a coverage status based on the stats
  const getCoverageStatus = () => {
    if (stats.coverage >= 90) return "success";
    if (stats.coverage >= 50) return "warning";
    return "error";
  };

  const error = "An error occurred";
  const hasWarning = true;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Hat Similarity System
        </CardTitle>
        <CardDescription>
          View and manage semantic relationships between hats for improved matching
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.total > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Embedding Coverage</span>
                <span>{stats.coverage}% ({stats.withEmbeddings}/{stats.total} hats)</span>
              </div>
              <Progress 
                value={stats.coverage} 
                className={`w-full ${
                  getCoverageStatus() === 'success' 
                    ? 'bg-green-100' 
                    : getCoverageStatus() === 'warning' 
                      ? 'bg-amber-100' 
                      : 'bg-red-100'
                }`}
              />
            </div>
          )}

          {stats.coverage < 50 && (
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Many hats are missing embeddings. Click "Refresh All" to generate them for better matching results.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {hasWarning && (
            <Alert className="mb-4 bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription>
                Some hat similarity data may be missing. Consider generating embeddings for better visualization.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              variant="outline"
              onClick={refreshAllEmbeddings}
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh All
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="embeddings">Hat Embeddings</TabsTrigger>
              <TabsTrigger value="similarities">Similarity Matrix</TabsTrigger>
            </TabsList>

            <TabsContent value="embeddings" className="space-y-4">
              {loading ? (
                <div className="text-center py-6 text-gray-500">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  Loading hat embeddings...
                </div>
              ) : filteredEmbeddings.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  {searchTerm ? (
                    <>No hat embeddings match your search.</>
                  ) : (
                    <>
                      No hat embeddings found. Click "Refresh All" to generate
                      embeddings for all hats in the system.
                    </>
                  )}
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hat Name</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmbeddings.map((embedding) => (
                        <TableRow key={embedding.id}>
                          <TableCell>
                            <Badge variant="outline">{embedding.hat_name}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(embedding.updated_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => refreshHatEmbedding(embedding.hat_name)}
                              disabled={refreshing}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="similarities" className="space-y-4">
              {loading ? (
                <div className="text-center py-6 text-gray-500">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  Loading hat similarities...
                </div>
              ) : filteredSimilarities.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  {searchTerm ? (
                    <>No hat similarities match your search.</>
                  ) : (
                    <>
                      No hat similarities found. Click "Refresh All" to generate
                      similarity data.
                    </>
                  )}
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hat 1</TableHead>
                        <TableHead>Hat 2</TableHead>
                        <TableHead>Similarity Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSimilarities.map((similarity, index) => (
                        <TableRow key={`${similarity.hat1}-${similarity.hat2}-${index}`}>
                          <TableCell>
                            <Badge variant="outline">{similarity.hat1}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{similarity.hat2}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    similarity.similarity > 0.7 
                                      ? 'bg-green-500' 
                                      : similarity.similarity > 0.4 
                                        ? 'bg-amber-500' 
                                        : 'bg-primary'
                                  }`}
                                  style={{
                                    width: `${Math.round(similarity.similarity * 100)}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm">
                                {Math.round(similarity.similarity * 100)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};
