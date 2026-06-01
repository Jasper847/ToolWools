/* =============================================
   AI Sentiment Analyzer — Core Logic
   ============================================= */

// Compact AFINN-165 mapped lexicon for positive and negative weights
const sentimentLexicon = {
  // Positive Words (Valence 1 to 5)
  "love": 3, "loved": 3, "loves": 3, "loving": 3, "adored": 4, "adore": 4, "adopts": 1,
  "like": 2, "liked": 2, "likes": 2, "good": 2, "great": 3, "excellent": 4, "amazing": 4,
  "awesome": 4, "happy": 3, "joy": 3, "perfect": 4, "wonderful": 4, "beautiful": 3,
  "best": 3, "friendly": 2, "helpful": 2, "satisfy": 2, "satisfied": 2, "satisfying": 3,
  "satisfaction": 3, "superb": 5, "fantastic": 4, "outstanding": 5, "recommend": 2,
  "smart": 2, "clever": 2, "clean": 2, "fast": 2, "efficient": 2, "safe": 2, "secure": 2,
  "win": 4, "winner": 4, "winning": 4, "won": 3, "bonus": 3, "easy": 2, "easier": 2,
  "easiest": 3, "glad": 3, "smile": 2, "smiling": 2, "cheer": 2, "cheerful": 3,
  "nice": 2, "pleasant": 3, "pleasure": 3, "proud": 2, "quality": 2, "support": 2,
  "trust": 2, "trusting": 2, "trusty": 2, "valuable": 2, "value": 2, "worth": 2,
  "worthy": 2, "benefit": 2, "beneficial": 3, "dynamic": 2, "success": 3, "successful": 3,
  "successfully": 3, "progress": 2, "improve": 2, "improved": 2, "improving": 2,
  "improvement": 2, "correct": 2, "correctly": 2, "perfectly": 4, "active": 1,
  "actively": 1, "admire": 3, "advantage": 2, "advantages": 2, "agree": 1, "agreed": 1,
  "agreement": 1, "alert": 1, "alive": 1, "amuse": 3, "amused": 3, "amusing": 2,
  "angel": 3, "appeal": 2, "approve": 2, "approval": 2, "award": 3, "awards": 3,
  "beautifully": 3, "beloved": 3, "benefits": 2, "bliss": 5, "brave": 2, "bright": 1,
  "brilliant": 4, "calm": 2, "celebrate": 3, "charm": 3, "charming": 3, "cheers": 2,
  "clear": 1, "comfort": 2, "comfortable": 2, "commend": 2, "compassion": 3,
  "congratulate": 3, "content": 2, "cool": 1, "courage": 2, "creative": 2, "delight": 3,
  "delighted": 3, "delightful": 4, "deserve": 2, "desirable": 2, "desire": 1, "eager": 2,
  "easily": 2, "educate": 2, "elegant": 2, "enjoy": 2, "enjoyed": 2, "enjoying": 2,
  "entertain": 2, "enthusiast": 2, "enthusiasm": 3, "enthusiastic": 3, "excite": 3,
  "excited": 3, "exciting": 3, "excitement": 3, "fair": 2, "faith": 2, "fame": 1,
  "famous": 2, "favor": 2, "favorite": 2, "fine": 2, "fit": 1, "free": 1, "freedom": 2,
  "fresh": 1, "fun": 4, "funny": 4, "generous": 2, "genius": 4, "gentle": 2, "gift": 2,
  "glory": 2, "glowing": 2, "gold": 2, "golden": 2, "grace": 2, "grateful": 3,
  "growth": 2, "handsome": 3, "happiness": 4, "happily": 3, "harmony": 2, "heal": 2,
  "healthy": 2, "heaven": 4, "hero": 3, "heroic": 3, "honest": 2, "honesty": 2,
  "honor": 2, "hope": 2, "hopeful": 2, "hug": 2, "humor": 2, "ideal": 3, "inspire": 3,
  "inspired": 3, "inspiring": 3, "inspiration": 3, "intelligent": 2, "interest": 2,
  "interested": 2, "interesting": 2, "invent": 2, "invite": 1, "joyful": 4,
  "joyous": 4, "kiss": 2, "laugh": 1, "laughing": 1, "laughter": 2, "lead": 2,
  "leader": 2, "legend": 3, "legendary": 4, "liberal": 1, "light": 1, "lively": 2,
  "loyal": 3, "luck": 3, "lucky": 3, "luxury": 2, "magnificent": 4, "marvel": 3,
  "masterpiece": 4, "mercy": 2, "merry": 3, "miracle": 4, "natural": 1, "noble": 2,
  "original": 1, "paradise": 4, "patience": 2, "patient": 2, "peace": 2, "peaceful": 2,
  "play": 1, "pleased": 3, "popular": 2, "positive": 2, "precious": 3, "premium": 2,
  "pretty": 1, "prize": 3, "progressive": 2, "promise": 1, "pure": 2, "ready": 1,
  "relief": 2, "respect": 2, "respected": 2, "reward": 2, "rich": 2, "romance": 2,
  "romantic": 2, "safety": 2, "save": 2, "share": 1, "shared": 1, "shield": 1,
  "shine": 2, "shiny": 2, "silent": 1, "smooth": 2, "soul": 1, "special": 2,
  "splendid": 3, "strong": 2, "succeed": 3, "super": 3, "truth": 2, "useful": 2,
  "valid": 2, "victory": 4, "virtue": 2, "warm": 1, "wealth": 3, "welcome": 2,
  "wild": 1, "wisdom": 3, "wise": 2, "wonder": 2, "wonderous": 4, "youth": 1,

  // Negative Words (Valence -1 to -5)
  "hate": -3, "hated": -3, "hates": -3, "hating": -3, "dislike": -2, "disliked": -2,
  "bad": -3, "worst": -3, "terrible": -3, "horrible": -4, "awful": -3, "sad": -2,
  "angry": -3, "broken": -1, "useless": -3, "waste": -2, "wasted": -2, "wrong": -2,
  "fail": -2, "failed": -2, "failing": -2, "failure": -3, "poor": -2, "poorly": -2,
  "slow": -2, "expensive": -1, "crash": -2, "crashed": -2, "crashing": -2, "bug": -2,
  "bugs": -2, "annoy": -2, "annoyed": -2, "annoying": -2, "bore": -2, "bored": -2,
  "boring": -3, "cheap": -1, "complain": -2, "complained": -2, "complaining": -2,
  "complaint": -2, "complaints": -2, "damage": -3, "damaged": -3, "damaging": -3,
  "dead": -3, "defect": -3, "defective": -3, "delay": -1, "delayed": -1, "difficult": -1,
  "disappoint": -2, "disappointed": -2, "disappointing": -3, "disappointment": -2,
  "error": -2, "errors": -2, "fear": -2, "hard": -1, "harm": -2, "harmful": -2,
  "hurt": -2, "ignore": -1, "ignored": -2, "lame": -2, "lose": -3, "loser": -3,
  "losing": -2, "loss": -3, "lost": -2, "mess": -2, "messy": -2, "mistake": -2,
  "mistakes": -2, "pain": -2, "painful": -2, "problem": -2, "problems": -2, "scam": -4,
  "scammed": -4, "spam": -2, "stress": -1, "stressed": -2, "stressful": -2, "stupid": -3,
  "ugly": -3, "unhappy": -2, "unsafe": -2, "unsatisfied": -2, "warn": -1, "warning": -2,
  "worry": -3, "worried": -3, "worrying": -3, "worse": -3, "abandon": -2, "abandoned": -2,
  "abuse": -3, "abused": -3, "accidental": -2, "ache": -2, "aching": -2, "afraid": -2,
  "aggressive": -1, "agony": -3, "alarm": -1, "alone": -2, "anger": -3, "anti": -1,
  "anxiety": -2, "anxious": -2, "apologetic": -1, "apologize": -1, "argue": -1,
  "argument": -1, "arrest": -2, "attack": -1, "awkward": -2, "ban": -2, "banish": -1,
  "betrayal": -3, "bitter": -2, "blame": -2, "blocked": -1, "bloody": -3, "bold": 1,
  "bomb": -1, "bother": -2, "breakdown": -2, "burden": -2, "cancer": -1, "careless": -2,
  "chaos": -2, "cheat": -3, "cheated": -3, "cold": -1, "collapse": -2, "collusion": -3,
  "combat": -1, "conflict": -2, "confuse": -2, "confused": -2, "crime": -3,
  "criminal": -3, "crisis": -3, "cruel": -3, "cruelty": -3, "cry": -1, "crying": -2,
  "danger": -2, "dangerous": -2, "dark": -1, "death": -2, "debt": -2, "decay": -2,
  "defeat": -2, "defeated": -2, "delete": -1, "demand": -1, "demon": -3, "deny": -2,
  "denied": -2, "depress": -2, "depressed": -2, "depressing": -2, "depression": -2,
  "deprive": -2, "desert": -1, "desolate": -2, "despair": -3, "destroy": -3,
  "destroyed": -3, "destruction": -3, "disaster": -3, "disastrous": -3, "disease": -1,
  "distrust": -3, "doom": -2, "doubt": -1, "dread": -2, "drug": -1, "dull": -2,
  "dumb": -3, "enemy": -2, "envy": -1, "evil": -3, "fake": -3, "false": -1,
  "fatal": -3, "fight": -1, "fire": -2, "flood": -1, "fool": -2, "foolish": -2,
  "forbid": -1, "forced": -1, "forget": -1, "forgotten": -1, "fraud": -4, "freeze": -1,
  "fright": -2, "frustrate": -2, "frustrated": -2, "frustration": -2, "fury": -2,
  "gloom": -2, "gloomy": -2, "grief": -2, "grieve": -2, "grim": -2, "gross": -2,
  "guilt": -2, "guilty": -2, "hazard": -2, "hell": -3, "helpless": -2, "hijack": -2,
  "hostage": -2, "hostile": -2, "ill": -2, "illegal": -3, "illiteracy": -2,
  "immature": -2, "impose": -1, "prison": -2, "infection": -2, "injure": -2,
  "injury": -2, "injustice": -2, "insane": -2, "insult": -2, "invade": -1,
  "jealous": -2, "junk": -2, "kill": -3, "killed": -3, "killer": -3, "leak": -1,
  "liar": -3, "lie": -3, "limit": -1, "limited": -1, "lonely": -2, "loop": -1,
  "lunatic": -3, "mad": -2, "madness": -2, "manipulate": -1, "murder": -2, "naive": -2,
  "nasty": -3, "negative": -2, "neglect": -2, "nervous": -1, "noise": -1, "noisy": -1,
  "nonsense": -2, "noose": -2, "nuisance": -2, "odd": -1, "offend": -2, "offense": -2,
  "offensive": -2, "oppose": -1, "outrage": -3, "panic": -3, "paralyze": -2,
  "penalty": -2, "pessimist": -2, "plague": -3, "poison": -2, "polluted": -2,
  "pollution": -2, "poverty": -1, "pressure": -1, "prisoner": -2, "punish": -2,
  "punishment": -2, "rage": -2, "raid": -1, "rape": -4, "rebel": -1, "reject": -1,
  "rejection": -2, "sadness": -2, "savage": -2, "scare": -2, "scared": -2, "scary": -2,
  "scream": -2, "shame": -2, "shock": -2, "shocked": -2, "shoot": -1, "shot": -1,
  "sick": -2, "sickness": -2, "sin": -2, "sinister": -2, "skepticism": -2,
  "slave": -3, "slavery": -3, "slump": -2, "smash": -1, "smuggle": -2, "sorrow": -2,
  "sour": -1, "steal": -2, "stereotype": -1, "strike": -1, "stroke": -1, "struggle": -1,
  "suffer": -2, "suffering": -2, "suicide": -4, "suspect": -1, "suspicious": -2,
  "tension": -1, "terror": -3, "terrorism": -3, "threat": -2, "threaten": -2,
  "toxic": -3, "tragedy": -3, "tragic": -3, "trap": -1, "trash": -2, "trauma": -3,
  "treason": -3, "trouble": -2, "uncomfortable": -2, "under": -1, "uneasy": -2,
  "unexpected": -1, "unfair": -2, "unfortunate": -2, "unique": 2, "unnatural": -2,
  "unproved": -1, "unreal": -1, "unreliable": -2, "unrest": -2, "unstable": -2,
  "unusual": -1, "unwanted": -2, "unworthy": -2, "vague": -1, "vanish": -1,
  "victim": -3, "vile": -3, "violence": -3, "violent": -3, "weak": -2, "weakness": -2,
  "weep": -2, "wept": -2, "wicked": -2, "witch": -1, "woe": -3, "wreck": -2
};

// Negation words set that inverts polarity of the following word
const negationWords = new Set([
  "not", "no", "never", "cannot", "cant", "dont", "wont", "shouldnt", "couldnt", 
  "wouldnt", "neither", "nor", "none", "doesnt", "isnt", "wasnt", "arent", "werent"
]);

// Main function to analyze text
function analyzeSentimentText(text) {
  if (!text) {
    return {
      score: 0,
      comparative: 0,
      polarity: "neutral",
      tokens: [],
      wordsAnalyzed: [],
      positiveCount: 0,
      negativeCount: 0,
      emotionalIntensity: 0
    };
  }

  // Clean and tokenize text
  // We keep words, remove punctuation, and lowercase everything
  const cleanedText = text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, " ")
    .replace(/\s+/g, " ");
  
  const tokens = cleanedText.split(" ").filter(t => t.length > 0);
  
  let totalScore = 0;
  let matchesCount = 0;
  let positiveCount = 0;
  let negativeCount = 0;
  const wordsAnalyzed = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    // Check if token exists in sentiment lexicon
    if (sentimentLexicon.hasOwnProperty(token)) {
      let weight = sentimentLexicon[token];
      let isNegated = false;

      // Lookback check for negation (within previous 2 tokens)
      if (i > 0) {
        const prev1 = tokens[i - 1];
        if (negationWords.has(prev1)) {
          isNegated = true;
        } else if (i > 1) {
          const prev2 = tokens[i - 2];
          // Check if there is an intervening modifier like "very" or "really"
          if (negationWords.has(prev2) && (prev1 === "very" || prev1 === "really" || prev1 === "extremely" || prev1 === "quite")) {
            isNegated = true;
          }
        }
      }

      if (isNegated) {
        weight = -weight; // Invert score polarity
      }

      totalScore += weight;
      matchesCount++;

      if (weight > 0) {
        positiveCount++;
      } else if (weight < 0) {
        negativeCount++;
      }

      // Track analyzed words for breakdown visualization
      const existingMatch = wordsAnalyzed.find(w => w.word === token);
      if (existingMatch) {
        existingMatch.frequency++;
        existingMatch.totalContribution += weight;
      } else {
        wordsAnalyzed.push({
          word: token,
          valence: sentimentLexicon[token],
          negated: isNegated,
          netScore: weight,
          frequency: 1,
          totalContribution: weight
        });
      }
    }
  }

  // Calculate stats
  const totalWords = tokens.length;
  const comparative = totalWords > 0 ? (totalScore / totalWords) * 10 : 0; // Scale comparative score
  
  // Polarity categorization based on totalScore and comparative score
  let polarity = "neutral";
  if (totalScore > 2 || comparative > 0.6) {
    polarity = totalScore > 5 || comparative > 1.5 ? "highly positive" : "positive";
  } else if (totalScore < -2 || comparative < -0.6) {
    polarity = totalScore < -5 || comparative < -1.5 ? "highly negative" : "negative";
  }

  // Emotional intensity represents the ratio of sentiment words to total words
  const emotionalIntensity = totalWords > 0 ? Math.round((matchesCount / totalWords) * 100) : 0;

  return {
    score: Number(totalScore.toFixed(1)),
    comparative: Number(comparative.toFixed(2)),
    polarity: polarity,
    tokens: tokens,
    wordsAnalyzed: wordsAnalyzed.sort((a, b) => Math.abs(b.totalContribution) - Math.abs(a.totalContribution)),
    positiveCount: positiveCount,
    negativeCount: negativeCount,
    emotionalIntensity: emotionalIntensity
  };
}
