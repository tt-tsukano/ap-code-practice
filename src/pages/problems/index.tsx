import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProblemLoader } from '@/lib/problem-loader';
import { Problem, isAlgorithmProblem, isDatabaseProblem } from '@/types/problem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Brain, Database, ChevronRight } from 'lucide-react';

export default function ProblemsListPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProblems() {
      try {
        const allProblems = await ProblemLoader.loadAllProblems();
        setProblems(allProblems);
      } catch (error) {
        console.error('Failed to load problems:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProblems();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">問題を読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">応用情報技術者試験 問題一覧</h1>
        <p className="text-gray-600 mt-2">
          実際にコードを実行して学習できる過去問題です。
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {problems.map((problem) => (
          <Card key={problem.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge 
                  variant={problem.category === 'algorithm' ? 'default' : 'secondary'}
                  className="mb-2"
                >
                  {problem.category === 'algorithm' ? (
                    <><Brain className="w-3 h-3 mr-1" /> アルゴリズム</>
                  ) : (
                    <><Database className="w-3 h-3 mr-1" /> データベース</>
                  )}
                </Badge>
                <Badge variant="outline">
                  {problem.difficulty === 'basic' ? '基礎' : 
                   problem.difficulty === 'intermediate' ? '中級' : '上級'}
                </Badge>
              </div>
              <CardTitle className="text-lg">{problem.title}</CardTitle>
              <CardDescription>
                {problem.year}年{problem.season === 'spring' ? '春期' : '秋期'} 問{problem.number}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <Clock className="w-4 h-4 mr-1" />
                想定時間: {problem.estimatedTime}分
              </div>
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {problem.description.slice(0, 100)}...
              </p>
              <Button asChild className="w-full">
                <Link to={`/problems/${problem.id}`}>
                  学習を開始 <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {problems.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">問題が見つかりませんでした。</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            再読み込み
          </Button>
        </div>
      )}
    </div>
  );
}