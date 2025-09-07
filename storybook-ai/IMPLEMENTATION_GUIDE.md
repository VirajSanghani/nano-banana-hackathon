# Storybook AI - Complete Implementation Guide
## Step-by-Step Build Instructions for Hackathon Success

### 🎯 Quick Start Commands

```bash
# Clone and setup
cd /Users/vs/nano-banana/storybook-ai
flutter create --org com.nanobanana --platforms ios,android storybook_ai
cd storybook_ai

# Add all dependencies at once
flutter pub add \
  dio:^5.4.0 \
  hive:^2.2.3 \
  hive_flutter:^1.1.0 \
  flutter_bloc:^8.1.3 \
  freezed_annotation:^2.4.1 \
  json_annotation:^4.8.1 \
  audioplayers:^5.2.1 \
  lottie:^3.0.0 \
  permission_handler:^11.1.0 \
  speech_to_text:^6.5.1 \
  share_plus:^7.2.1 \
  cached_network_image:^3.3.1 \
  shimmer:^3.0.0 \
  uuid:^4.2.2 \
  collection:^1.18.0 \
  path_provider:^2.1.1 \
  equatable:^2.0.5 \
  http:^1.1.2 \
  flutter_dotenv:^5.1.0

# Dev dependencies
flutter pub add --dev \
  build_runner:^2.4.7 \
  freezed:^2.4.6 \
  json_serializable:^6.7.1 \
  flutter_launcher_icons:^0.13.1
```

---

## 📱 Step 1: iOS Configuration

### Update `ios/Runner/Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Storybook AI needs microphone access to hear your story ideas</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>Storybook AI uses speech recognition to understand your story ideas</string>
<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>
<key>CFBundleDisplayName</key>
<string>Storybook AI</string>
```

---

## 🎨 Step 2: Core App Setup

### `lib/main.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'core/di/injection_container.dart' as di;
import 'presentation/app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Load environment variables
  await dotenv.load(fileName: ".env");
  
  // Initialize Hive for local storage
  await Hive.initFlutter();
  
  // Setup dependency injection
  await di.init();
  
  // Lock to portrait mode for consistent experience
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarBrightness: Brightness.light,
    ),
  );
  
  runApp(const StorybookAIApp());
}
```

### `lib/presentation/app.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/theme/app_theme.dart';
import 'core/routes/app_router.dart';
import 'presentation/blocs/story_generation/story_generation_bloc.dart';
import 'core/di/injection_container.dart';

class StorybookAIApp extends StatelessWidget {
  const StorybookAIApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (_) => sl<StoryGenerationBloc>(),
        ),
        BlocProvider(
          create: (_) => sl<LibraryBloc>(),
        ),
        BlocProvider(
          create: (_) => sl<AudioPlaybackBloc>(),
        ),
      ],
      child: MaterialApp(
        title: 'Storybook AI',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: _getThemeMode(),
        onGenerateRoute: AppRouter.generateRoute,
        initialRoute: AppRouter.home,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
  
  ThemeMode _getThemeMode() {
    final hour = DateTime.now().hour;
    // Auto dark mode after 7 PM
    return (hour >= 19 || hour < 7) ? ThemeMode.dark : ThemeMode.light;
  }
}
```

---

## 🏗️ Step 3: Character Consistency Implementation

### `lib/core/services/character_consistency_service.dart`:

```dart
import 'dart:convert';
import 'package:uuid/uuid.dart';
import '../models/character_profile.dart';
import 'gemini_service.dart';

class CharacterConsistencyService {
  final GeminiService _geminiService;
  final Map<String, CharacterProfile> _characterCache = {};
  
  CharacterConsistencyService(this._geminiService);
  
  Future<CharacterProfile> extractCharacterFromIdea(String childIdea) async {
    // Check cache first
    final cacheKey = _generateCacheKey(childIdea);
    if (_characterCache.containsKey(cacheKey)) {
      return _characterCache[cacheKey]!;
    }
    
    const prompt = '''
    Analyze this child's story idea and extract the main character:
    "$childIdea"
    
    Return a JSON object with:
    {
      "name": "character name",
      "species": "animal/human/creature type",
      "primaryColor": "main color",
      "colorHex": "#hexcode",
      "size": "small/medium/large",
      "distinctiveFeatures": ["feature1", "feature2"],
      "accessories": ["item1", "item2"],
      "personality": {
        "traits": ["brave", "curious"],
        "mood": "happy/adventurous/calm"
      }
    }
    ''';
    
    final response = await _geminiService.generateContent(prompt);
    final json = jsonDecode(response);
    
    final character = CharacterProfile(
      id: const Uuid().v4(),
      name: json['name'],
      species: json['species'],
      primaryColor: json['primaryColor'],
      colorHex: json['colorHex'],
      size: json['size'],
      distinctiveFeatures: List<String>.from(json['distinctiveFeatures']),
      accessories: List<String>.from(json['accessories']),
      personality: PersonalityTraits.fromJson(json['personality']),
    );
    
    _characterCache[cacheKey] = character;
    return character;
  }
  
  String buildConsistentImagePrompt({
    required CharacterProfile character,
    required String scene,
    required int pageNumber,
    List<String>? previousImageDescriptions,
  }) {
    final previousContext = previousImageDescriptions?.isNotEmpty == true
        ? 'IMPORTANT: This character appeared in previous pages with these exact details:\n${previousImageDescriptions!.join('\n')}'
        : '';
    
    return '''
    Create a children's book illustration with these EXACT specifications:
    
    CRITICAL CHARACTER CONSISTENCY:
    You MUST draw ${character.name} the ${character.species} with these EXACT features:
    - Primary color: ${character.primaryColor} (${character.colorHex})
    - Size: ${character.size}
    - MUST HAVE these distinctive features: ${character.distinctiveFeatures.join(', ')}
    - MUST WEAR/HAVE these items: ${character.accessories.join(', ')}
    
    $previousContext
    
    SCENE DESCRIPTION:
    $scene
    
    STYLE REQUIREMENTS:
    - Soft, dreamlike children's book illustration
    - Warm, inviting colors
    - Age-appropriate for 3-8 years old
    - No scary or dark elements
    - Clear, simple composition
    
    CRITICAL: The character MUST look IDENTICAL to any previous appearances.
    ''';
  }
  
  String _generateCacheKey(String idea) {
    return base64Encode(utf8.encode(idea)).substring(0, 20);
  }
}
```

---

## 🎯 Step 4: Story Generation Pipeline

### `lib/core/services/story_generation_service.dart`:

```dart
import 'dart:async';
import 'package:uuid/uuid.dart';
import '../models/story.dart';
import '../models/story_page.dart';
import 'gemini_service.dart';
import 'elevenlabs_service.dart';
import 'fal_music_service.dart';
import 'character_consistency_service.dart';

class StoryGenerationService {
  final GeminiService _geminiService;
  final ElevenLabsService _elevenLabsService;
  final FalMusicService _falMusicService;
  final CharacterConsistencyService _characterService;
  
  StoryGenerationService(
    this._geminiService,
    this._elevenLabsService,
    this._falMusicService,
    this._characterService,
  );
  
  Stream<StoryGenerationProgress> generateStory(String childIdea) async* {
    try {
      // Step 1: Validate and sanitize input
      yield StoryGenerationProgress(
        stage: 'Checking your idea',
        progress: 0.1,
        message: 'Making sure your story is safe and fun...',
      );
      
      final sanitizedIdea = await _sanitizeIdea(childIdea);
      
      // Step 2: Generate story outline
      yield StoryGenerationProgress(
        stage: 'Writing story',
        progress: 0.2,
        message: 'Creating your magical story...',
      );
      
      final outline = await _generateOutline(sanitizedIdea);
      
      // Step 3: Extract character
      yield StoryGenerationProgress(
        stage: 'Creating character',
        progress: 0.3,
        message: 'Bringing ${outline.characterName} to life...',
      );
      
      final character = await _characterService.extractCharacterFromIdea(sanitizedIdea);
      
      // Step 4: Generate pages
      final pages = <StoryPage>[];
      final imageDescriptions = <String>[];
      
      for (int i = 0; i < 5; i++) {
        yield StoryGenerationProgress(
          stage: 'Creating pages',
          progress: 0.3 + (0.1 * i),
          message: 'Creating page ${i + 1} of 5...',
        );
        
        final page = await _generatePage(
          outline: outline,
          pageNumber: i,
          character: character,
          previousDescriptions: imageDescriptions,
        );
        
        pages.add(page);
        imageDescriptions.add(page.imagePrompt);
      }
      
      // Step 5: Generate background music
      yield StoryGenerationProgress(
        stage: 'Adding music',
        progress: 0.9,
        message: 'Adding gentle music...',
      );
      
      final musicUrl = await _falMusicService.generateBackgroundMusic(
        mood: outline.mood,
        duration: 150, // 30 seconds per page
      );
      
      // Step 6: Compile story
      final story = Story(
        id: const Uuid().v4(),
        title: outline.title,
        pages: pages,
        character: character,
        backgroundMusicUrl: musicUrl,
        createdAt: DateTime.now(),
      );
      
      yield StoryGenerationProgress(
        stage: 'Complete',
        progress: 1.0,
        message: 'Your story is ready!',
        story: story,
      );
      
    } catch (e) {
      yield StoryGenerationProgress(
        stage: 'Error',
        progress: 0.0,
        message: 'Oops! Something went wrong: ${e.toString()}',
        error: e.toString(),
      );
    }
  }
  
  Future<StoryOutline> _generateOutline(String idea) async {
    const prompt = '''
    Create a 5-page bedtime story for a young child (3-8 years old) based on: "$idea"
    
    Requirements:
    - Gentle, calming story suitable for bedtime
    - Happy ending
    - Simple conflict that resolves nicely
    - Include one choice point after page 2 and page 3
    
    Return JSON:
    {
      "title": "Story Title",
      "characterName": "Main character name",
      "mood": "calm|adventurous|silly|sweet",
      "pages": [
        {
          "text": "2-3 sentences for this page",
          "sceneDescription": "What's happening visually",
          "choice": null or {
            "question": "What should CHARACTER do?",
            "optionA": "Choice 1",
            "optionB": "Choice 2"
          }
        }
      ]
    }
    ''';
    
    final response = await _geminiService.generateJSON(prompt);
    return StoryOutline.fromJson(response);
  }
  
  Future<StoryPage> _generatePage({
    required StoryOutline outline,
    required int pageNumber,
    required CharacterProfile character,
    required List<String> previousDescriptions,
  }) async {
    final pageData = outline.pages[pageNumber];
    
    // Generate image with character consistency
    final imagePrompt = _characterService.buildConsistentImagePrompt(
      character: character,
      scene: pageData.sceneDescription,
      pageNumber: pageNumber,
      previousImageDescriptions: previousDescriptions,
    );
    
    // Parallel generation
    final results = await Future.wait([
      _geminiService.generateImage(imagePrompt),
      _elevenLabsService.generateNarration(
        text: pageData.text,
        voice: 'warm_female_narrator',
      ),
    ]);
    
    return StoryPage(
      number: pageNumber + 1,
      text: pageData.text,
      imageUrl: results[0] as String,
      audioUrl: results[1] as String,
      imagePrompt: imagePrompt,
      choice: pageData.choice,
    );
  }
  
  Future<String> _sanitizeIdea(String idea) async {
    // Simple content filter
    const inappropriateWords = ['scary', 'death', 'kill', 'blood'];
    var sanitized = idea.toLowerCase();
    
    for (final word in inappropriateWords) {
      sanitized = sanitized.replaceAll(word, '');
    }
    
    return sanitized.trim();
  }
}
```

---

## 🎤 Step 5: Voice Input Implementation

### `lib/presentation/screens/voice_input_screen.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:speech_to_text/speech_to_text.dart';
import 'package:lottie/lottie.dart';
import '../blocs/story_generation/story_generation_bloc.dart';
import '../widgets/animated_microphone.dart';

class VoiceInputScreen extends StatefulWidget {
  const VoiceInputScreen({Key? key}) : super(key: key);

  @override
  State<VoiceInputScreen> createState() => _VoiceInputScreenState();
}

class _VoiceInputScreenState extends State<VoiceInputScreen>
    with SingleTickerProviderStateMixin {
  final SpeechToText _speech = SpeechToText();
  bool _isListening = false;
  String _transcribedText = '';
  late AnimationController _animationController;
  
  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
    _initSpeech();
  }
  
  Future<void> _initSpeech() async {
    final available = await _speech.initialize(
      onStatus: (status) {
        if (status == 'done' || status == 'notListening') {
          setState(() => _isListening = false);
        }
      },
      onError: (error) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${error.errorMsg}')),
        );
      },
    );
    
    if (available) {
      _startListening();
    }
  }
  
  Future<void> _startListening() async {
    if (!_isListening) {
      setState(() {
        _isListening = true;
        _transcribedText = '';
      });
      
      await _speech.listen(
        onResult: (result) {
          setState(() {
            _transcribedText = result.recognizedWords;
          });
        },
        listenFor: const Duration(seconds: 30),
        pauseFor: const Duration(seconds: 3),
        partialResults: true,
        localeId: 'en_US',
      );
    }
  }
  
  void _stopListening() {
    _speech.stop();
    setState(() => _isListening = false);
  }
  
  void _confirmAndGenerate() {
    if (_transcribedText.isNotEmpty) {
      context.read<StoryGenerationBloc>().add(
        GenerateStoryEvent(childIdea: _transcribedText),
      );
      Navigator.pushReplacementNamed(context, '/generation');
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              const Spacer(),
              
              // Animated microphone
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                height: 200,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    if (_isListening)
                      Lottie.asset(
                        'assets/animations/sound_wave.json',
                        controller: _animationController,
                      ),
                    Icon(
                      Icons.mic,
                      size: 80,
                      color: _isListening
                          ? Theme.of(context).primaryColor
                          : Colors.grey,
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Status text
              Text(
                _isListening
                    ? "I'm listening..."
                    : _transcribedText.isEmpty
                        ? "Tap to speak"
                        : "Tap to try again",
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              
              const SizedBox(height: 32),
              
              // Transcribed text
              Container(
                height: 120,
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _isListening
                        ? Theme.of(context).primaryColor
                        : Colors.grey[300]!,
                    width: 2,
                  ),
                ),
                child: SingleChildScrollView(
                  child: Text(
                    _transcribedText.isEmpty
                        ? "Your story idea will appear here..."
                        : _transcribedText,
                    style: TextStyle(
                      fontSize: 16,
                      color: _transcribedText.isEmpty
                          ? Colors.grey
                          : Colors.black87,
                    ),
                  ),
                ),
              ),
              
              const Spacer(),
              
              // Action buttons
              Row(
                children: [
                  if (!_isListening && _transcribedText.isNotEmpty) ...[
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _startListening,
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                        ),
                        child: const Text("Try Again"),
                      ),
                    ),
                    const SizedBox(width: 16),
                  ],
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _isListening
                          ? _stopListening
                          : _transcribedText.isNotEmpty
                              ? _confirmAndGenerate
                              : _startListening,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                      ),
                      child: Text(
                        _isListening
                            ? "Stop"
                            : _transcribedText.isNotEmpty
                                ? "Create Story!"
                                : "Start Speaking",
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  @override
  void dispose() {
    _animationController.dispose();
    _speech.cancel();
    super.dispose();
  }
}
```

---

## 📖 Step 6: Story Viewer Implementation

### `lib/presentation/screens/story_viewer_screen.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:audioplayers/audioplayers.dart';
import '../models/story.dart';
import '../widgets/highlighted_text.dart';
import '../widgets/choice_overlay.dart';

class StoryViewerScreen extends StatefulWidget {
  final Story story;
  
  const StoryViewerScreen({Key? key, required this.story}) : super(key: key);
  
  @override
  State<StoryViewerScreen> createState() => _StoryViewerScreenState();
}

class _StoryViewerScreenState extends State<StoryViewerScreen> {
  final PageController _pageController = PageController();
  final AudioPlayer _audioPlayer = AudioPlayer();
  final AudioPlayer _backgroundMusicPlayer = AudioPlayer();
  
  int _currentPage = 0;
  bool _isPlaying = false;
  int _highlightStart = -1;
  int _highlightEnd = -1;
  
  @override
  void initState() {
    super.initState();
    _startBackgroundMusic();
    _playCurrentPageNarration();
  }
  
  Future<void> _startBackgroundMusic() async {
    if (widget.story.backgroundMusicUrl != null) {
      await _backgroundMusicPlayer.play(
        UrlSource(widget.story.backgroundMusicUrl!),
        volume: 0.2,
      );
      await _backgroundMusicPlayer.setReleaseMode(ReleaseMode.loop);
    }
  }
  
  Future<void> _playCurrentPageNarration() async {
    final page = widget.story.pages[_currentPage];
    setState(() => _isPlaying = true);
    
    await _audioPlayer.play(UrlSource(page.audioUrl));
    
    // Simulate word highlighting (in production, use actual timestamps)
    _simulateWordHighlighting(page.text);
  }
  
  void _simulateWordHighlighting(String text) {
    final words = text.split(' ');
    int currentIndex = 0;
    
    for (final word in words) {
      Future.delayed(Duration(milliseconds: 300 * words.indexOf(word)), () {
        if (mounted) {
          setState(() {
            _highlightStart = currentIndex;
            _highlightEnd = currentIndex + word.length;
          });
        }
      });
      currentIndex += word.length + 1;
    }
  }
  
  void _nextPage() {
    if (_currentPage < widget.story.pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOut,
      );
    }
  }
  
  void _previousPage() {
    if (_currentPage > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOut,
      );
    }
  }
  
  void _handleChoice(String choice) {
    // In production, this would alter the story path
    print('Choice selected: $choice');
    _nextPage();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFFF8DC), // Warm cream
      body: SafeArea(
        child: Stack(
          children: [
            // Main content
            PageView.builder(
              controller: _pageController,
              onPageChanged: (index) {
                setState(() => _currentPage = index);
                _playCurrentPageNarration();
              },
              itemCount: widget.story.pages.length,
              itemBuilder: (context, index) {
                final page = widget.story.pages[index];
                
                return Column(
                  children: [
                    // Header
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.arrow_back_ios),
                            onPressed: _currentPage == 0
                                ? () => Navigator.pop(context)
                                : _previousPage,
                          ),
                          Text(
                            'Page ${index + 1} of ${widget.story.pages.length}',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 14,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.more_vert),
                            onPressed: () {
                              // Show options menu
                            },
                          ),
                        ],
                      ),
                    ),
                    
                    // Image with Ken Burns effect
                    Expanded(
                      flex: 7,
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 20,
                              offset: const Offset(0, 10),
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(20),
                          child: CachedNetworkImage(
                            imageUrl: page.imageUrl,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => Container(
                              color: Colors.grey[200],
                              child: const Center(
                                child: CircularProgressIndicator(),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Story text
                    Expanded(
                      flex: 3,
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 24),
                        child: Column(
                          children: [
                            HighlightedText(
                              text: page.text,
                              highlightStart: _highlightStart,
                              highlightEnd: _highlightEnd,
                              style: const TextStyle(
                                fontSize: 18,
                                height: 1.6,
                                fontFamily: 'Baskerville',
                              ),
                            ),
                            
                            const SizedBox(height: 16),
                            
                            // Audio controls
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                IconButton(
                                  icon: Icon(
                                    _isPlaying
                                        ? Icons.pause_circle_filled
                                        : Icons.play_circle_filled,
                                    size: 48,
                                  ),
                                  color: Theme.of(context).primaryColor,
                                  onPressed: () {
                                    if (_isPlaying) {
                                      _audioPlayer.pause();
                                    } else {
                                      _audioPlayer.resume();
                                    }
                                    setState(() => _isPlaying = !_isPlaying);
                                  },
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
            
            // Choice overlay
            if (widget.story.pages[_currentPage].choice != null)
              ChoiceOverlay(
                choice: widget.story.pages[_currentPage].choice!,
                onChoiceSelected: _handleChoice,
              ),
            
            // Page indicators
            Positioned(
              bottom: 20,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  widget.story.pages.length,
                  (index) => Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: index == _currentPage
                          ? Theme.of(context).primaryColor
                          : Colors.grey[300],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  @override
  void dispose() {
    _audioPlayer.dispose();
    _backgroundMusicPlayer.dispose();
    super.dispose();
  }
}
```

---

## 🚀 Step 7: API Integration

### Create `.env` file:

```env
GEMINI_API_KEY=your-gemini-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
FAL_API_KEY=your-fal-api-key
```

### `lib/core/services/gemini_service.dart`:

```dart
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class GeminiService {
  final Dio _dio;
  final String _apiKey;
  
  GeminiService({Dio? dio}) 
      : _dio = dio ?? Dio(),
        _apiKey = dotenv.env['GEMINI_API_KEY'] ?? '' {
    _dio.options.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/';
    _dio.options.headers = {
      'Content-Type': 'application/json',
    };
  }
  
  Future<String> generateContent(String prompt) async {
    try {
      final response = await _dio.post(
        'models/gemini-2.5-flash:generateContent',
        queryParameters: {'key': _apiKey},
        data: {
          'contents': [{
            'parts': [{
              'text': prompt,
            }],
          }],
          'generationConfig': {
            'temperature': 0.7,
            'topK': 40,
            'topP': 0.95,
            'maxOutputTokens': 2048,
          },
          'safetySettings': [
            {
              'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
              'threshold': 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        },
      );
      
      return response.data['candidates'][0]['content']['parts'][0]['text'];
    } catch (e) {
      throw Exception('Failed to generate content: $e');
    }
  }
  
  Future<String> generateImage(String prompt) async {
    try {
      final response = await _dio.post(
        'models/gemini-2.5-flash-image-preview:generateContent',
        queryParameters: {'key': _apiKey},
        data: {
          'contents': [{
            'parts': [{
              'text': prompt,
            }],
          }],
          'generationConfig': {
            'temperature': 0.4,
            'topK': 32,
            'topP': 1,
            'maxOutputTokens': 1290,
          },
        },
      );
      
      // Extract image data and upload to CDN
      final imageData = response.data['candidates'][0]['content']['parts'][0]['inlineData'];
      return await _uploadToCloudinary(imageData['data']);
    } catch (e) {
      throw Exception('Failed to generate image: $e');
    }
  }
  
  Future<Map<String, dynamic>> generateJSON(String prompt) async {
    final response = await generateContent(prompt);
    // Extract JSON from response
    final jsonMatch = RegExp(r'\{.*\}', dotAll: true).firstMatch(response);
    if (jsonMatch != null) {
      return jsonDecode(jsonMatch.group(0)!);
    }
    throw Exception('Failed to parse JSON from response');
  }
  
  Future<String> _uploadToCloudinary(String base64Image) async {
    // In production, upload to CDN
    // For hackathon, return data URL
    return 'data:image/png;base64,$base64Image';
  }
}
```

---

## 🎮 Step 8: Hackathon Demo Mode

### `lib/core/utils/demo_mode.dart`:

```dart
import '../models/story.dart';
import '../models/story_page.dart';
import '../models/character_profile.dart';

class DemoMode {
  static bool isEnabled = true; // Set to true for hackathon
  
  static Story getPreCachedStory() {
    return Story(
      id: 'demo-story-1',
      title: 'Luna the Fox and the Moon',
      character: CharacterProfile(
        id: 'luna-fox',
        name: 'Luna',
        species: 'Fox',
        primaryColor: 'Orange',
        colorHex: '#FF6B35',
        size: 'Small',
        distinctiveFeatures: ['Fluffy tail', 'White chest patch'],
        accessories: ['Blue scarf'],
        personality: PersonalityTraits(
          traits: ['Curious', 'Brave'],
          mood: 'Adventurous',
        ),
      ),
      pages: [
        StoryPage(
          number: 1,
          text: 'Once upon a time, there lived a curious little fox named Luna who loved to gaze at the moon every night.',
          imageUrl: 'assets/demo/page1.png',
          audioUrl: 'assets/demo/page1.mp3',
        ),
        // Add more pages...
      ],
      backgroundMusicUrl: 'assets/demo/background_music.mp3',
      createdAt: DateTime.now(),
    );
  }
  
  static Future<T> simulateApiCall<T>(
    Future<T> Function() apiCall,
    T fallbackValue,
  ) async {
    if (!isEnabled) {
      return apiCall();
    }
    
    try {
      // Try real API with timeout
      return await apiCall().timeout(
        const Duration(seconds: 5),
        onTimeout: () => fallbackValue,
      );
    } catch (e) {
      // Return fallback for demo
      return fallbackValue;
    }
  }
}
```

---

## 🏃‍♂️ Step 9: Quick Run Commands

```bash
# Run on iOS Simulator
flutter run -d iPhone

# Run on physical iPhone (must be connected)
flutter run -d <device-id>

# Build for release
flutter build ios --release

# Run with demo mode
flutter run --dart-define=DEMO_MODE=true
```

---

## ✅ Step 10: Pre-Hackathon Checklist

### Technical Setup
- [ ] Flutter environment configured
- [ ] iOS simulator/device ready
- [ ] All API keys in .env file
- [ ] Dependencies installed
- [ ] Project builds successfully

### Demo Content
- [ ] 3 pre-cached stories ready
- [ ] Demo voice recordings
- [ ] Fallback images generated
- [ ] Background music files

### Testing
- [ ] Voice input working
- [ ] Story generation (with real APIs)
- [ ] Character consistency verified
- [ ] Audio playback smooth
- [ ] Page transitions working

### Presentation
- [ ] Demo device charged
- [ ] Backup device ready
- [ ] Screen recording prepared
- [ ] Internet hotspot backup
- [ ] Practice script ready

---

## 🎯 Hackathon Day Schedule

### Hour 0-1: Setup
- Set up development environment
- Create Flutter project
- Add dependencies
- Configure iOS settings

### Hour 1-3: Core Implementation
- Implement models and services
- Set up character consistency
- Create story generation pipeline

### Hour 3-5: UI Development
- Build main screens
- Implement voice input
- Create story viewer

### Hour 5-7: Integration
- Connect to APIs
- Test generation flow
- Add animations

### Hour 7-9: Features
- Implement audio sync
- Add choice system
- Create library screen

### Hour 9-10: Polish
- Fix bugs
- Optimize performance
- Add loading states

### Hour 10-11: Demo Prep
- Create backup stories
- Test full flow
- Practice presentation

### Hour 11-12: Final Testing
- Run through demo
- Verify all features
- Prepare for judges

---

## 🏆 Success Metrics

### Must Have (P0)
✅ Voice input captures story idea
✅ Generate 5-page story with images
✅ Character appears consistent across pages
✅ Audio narration plays
✅ Save story functionality

### Should Have (P1)
✅ Interactive choices
✅ Background music
✅ Library screen
✅ Smooth animations

### Nice to Have (P2)
⭐ Parent dashboard
⭐ Export to PDF
⭐ Share functionality
⭐ Multiple languages

This implementation guide provides everything needed to build Storybook AI successfully during the hackathon!