
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Comment {
  id: string;
  idea_id: string;
  content: string;
  created_at: string;
  author?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  profiles?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

interface IdeaCommentsProps {
  comments: Comment[];
}

export const IdeaComments = ({ comments }: IdeaCommentsProps) => {
  if (!comments || comments.length === 0) return null;

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto">
      {comments.map((comment, index) => {
        const profile = comment.author || comment.profiles;
        const firstName = profile?.first_name || 'Anonymous';
        const lastName = profile?.last_name || 'User';
        const avatarUrl = profile?.avatar_url || '';

        return (
          <div key={comment.id} className={`flex items-start gap-3 p-3 rounded-lg border ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName}`} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                {firstName?.[0] || 'A'}
                {lastName?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-gray-900">
                  {firstName} {lastName}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed break-words">{comment.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
