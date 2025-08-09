// Function to format notification type for display
export function formatNotificationType(type) {
  switch(type){
    case 'match_message':
      return 'Messages';
    case 'match_created':
      return 'New Matches';
    case 'new_idea':
      return 'New Content';
    case 'journey_notification':
      return 'Journey Updates';
    default:
      return type.replace(/_/g, ' ').replace(/\b\w/g, (l)=>l.toUpperCase());
  }
}
