/*
  # Publish all lessons
  
  Lessons need to be published to be visible to users
*/

UPDATE lessons SET is_published = true WHERE is_published = false;
