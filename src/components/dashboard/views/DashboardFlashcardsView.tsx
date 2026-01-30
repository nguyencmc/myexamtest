import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDecks } from '@/features/flashcards/hooks/useDecks';
import { useDueCards } from '@/features/flashcards/hooks/useDueCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DeckCard } from '@/features/flashcards/components/DeckCard';
import { 
  Layers, 
  Plus, 
  Clock, 
  ChevronRight,
  Sparkles 
} from 'lucide-react';

export const DashboardFlashcardsView = () => {
  const { user } = useAuth();
  const { decks, isLoading: decksLoading } = useDecks();
  const { dueCount, isLoading: dueLoading } = useDueCards();

  if (decksLoading || dueLoading) {
    return (
      <div className="p-4 sm:p-6 overflow-y-auto h-full">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 overflow-y-auto h-full">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Flashcards của tôi</h1>
              <p className="text-sm text-muted-foreground">
                Học và ôn tập với thẻ ghi nhớ
              </p>
            </div>
          </div>
          <Link to="/flashcards/decks">
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Tạo deck
            </Button>
          </Link>
        </div>
      </div>

      {/* Due Cards Banner */}
      {dueCount > 0 && (
        <Link to="/flashcards/today">
          <Card className="mb-6 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/20 hover:border-orange-500/40 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {dueCount} thẻ cần ôn tập hôm nay
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ôn tập ngay để không quên kiến thức
                  </p>
                </div>
              </div>
              <Button className="gap-2">
                <Sparkles className="w-4 h-4" />
                Ôn tập ngay
              </Button>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Decks Grid */}
      {decks && decks.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">
            Chưa có bộ thẻ nào
          </h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Tạo bộ thẻ flashcard đầu tiên để bắt đầu học
          </p>
          <Link to="/flashcards/decks">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Tạo bộ thẻ mới
            </Button>
          </Link>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link to="/flashcards/today">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-medium text-sm">Ôn tập hôm nay</p>
                <p className="text-xs text-muted-foreground">{dueCount} thẻ</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/flashcards/decks">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Quản lý decks</p>
                <p className="text-xs text-muted-foreground">{decks?.length || 0} bộ</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};
