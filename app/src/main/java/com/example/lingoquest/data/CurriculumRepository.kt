package com.example.lingoquest.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

class CurriculumRepository(private val context: Context) {

    private var cachedCurriculum: CurriculumData? = null

    fun getCurriculum(): CurriculumData {
        cachedCurriculum?.let { return it }

        val jsonString = context.assets.open("curriculum.json").bufferedReader().use { it.readText() }
        val root = JSONObject(jsonString)

        // Parse units
        val unitsList = mutableListOf<UnitModel>()
        val unitsArray = root.optJSONArray("units") ?: JSONArray()
        for (i in 0 until unitsArray.length()) {
            val unitObj = unitsArray.getJSONObject(i)
            val unitId = unitObj.getString("id")
            val unitTitle = unitObj.getString("title")
            val unitDesc = unitObj.optString("description", "")
            val unitIcon = unitObj.optString("icon", "📚")
            val unitColor = unitObj.optString("color", "#58CC02")

            val lessonsList = mutableListOf<LessonModel>()
            val lessonsArray = unitObj.optJSONArray("lessons") ?: JSONArray()
            for (j in 0 until lessonsArray.length()) {
                val lessonObj = lessonsArray.getJSONObject(j)
                val lessonId = lessonObj.getString("id")
                val lessonTitle = lessonObj.getString("title")
                val lessonXp = lessonObj.optInt("xp", 15)

                val exercisesList = mutableListOf<ExerciseModel>()
                val exercisesArray = lessonObj.optJSONArray("exercises") ?: JSONArray()
                for (k in 0 until exercisesArray.length()) {
                    val exObj = exercisesArray.getJSONObject(k)
                    val type = exObj.optString("type", "multiple_choice")
                    val prompt = exObj.optString("prompt", "")
                    val sentence = exObj.optString("sentence", "")
                    val translation = exObj.optString("translation", "")
                    val hint = exObj.optString("hint", "")
                    val correctIndex = exObj.optInt("correctIndex", 0)
                    val explanation = exObj.optString("explanation", "")

                    val solutionList = mutableListOf<String>()
                    val solutionArray = exObj.optJSONArray("solution")
                    if (solutionArray != null) {
                        for (s in 0 until solutionArray.length()) {
                            solutionList.add(solutionArray.getString(s))
                        }
                    }

                    val optionsList = mutableListOf<String>()
                    val optionsArray = exObj.optJSONArray("options")
                    if (optionsArray != null) {
                        for (o in 0 until optionsArray.length()) {
                            optionsList.add(optionsArray.getString(o))
                        }
                    }

                    val pairsList = mutableListOf<WordPair>()
                    val pairsArray = exObj.optJSONArray("pairs")
                    if (pairsArray != null) {
                        for (p in 0 until pairsArray.length()) {
                            val pairObj = pairsArray.getJSONObject(p)
                            pairsList.add(WordPair(
                                es = pairObj.optString("es", ""),
                                en = pairObj.optString("en", "")
                            ))
                        }
                    }

                    exercisesList.add(ExerciseModel(
                        type = type,
                        prompt = prompt,
                        sentence = sentence,
                        translation = translation,
                        solution = solutionList,
                        options = optionsList,
                        hint = hint,
                        correctIndex = correctIndex,
                        explanation = explanation,
                        pairs = pairsList
                    ))
                }

                lessonsList.add(LessonModel(
                    id = lessonId,
                    title = lessonTitle,
                    xp = lessonXp,
                    exercises = exercisesList
                ))
            }

            unitsList.add(UnitModel(
                id = unitId,
                title = unitTitle,
                description = unitDesc,
                icon = unitIcon,
                colorHex = unitColor,
                lessons = lessonsList
            ))
        }

        // Parse Flashcards
        val flashcardsList = mutableListOf<FlashcardModel>()
        val flashcardsArray = root.optJSONArray("flashcards") ?: JSONArray()
        for (i in 0 until flashcardsArray.length()) {
            val fObj = flashcardsArray.getJSONObject(i)
            flashcardsList.add(FlashcardModel(
                id = fObj.optString("id", "fc-$i"),
                en = fObj.optString("en", ""),
                es = fObj.optString("es", ""),
                phonetic = fObj.optString("phonetic", ""),
                category = fObj.optString("category", "General"),
                example = fObj.optString("example", "")
            ))
        }

        // Parse Speed Match Pool
        val speedMatchList = mutableListOf<SpeedMatchPair>()
        val smArray = root.optJSONArray("speedMatchPool") ?: JSONArray()
        for (i in 0 until smArray.length()) {
            val smObj = smArray.getJSONObject(i)
            speedMatchList.add(SpeedMatchPair(
                id = smObj.optString("id", "sm-$i"),
                en = smObj.optString("en", ""),
                es = smObj.optString("es", "")
            ))
        }

        // Parse Sentence Scrambles
        val scrambleList = mutableListOf<SentenceScrambleModel>()
        val scrambleArray = root.optJSONArray("sentenceScramblePool") ?: JSONArray()
        for (i in 0 until scrambleArray.length()) {
            val scObj = scrambleArray.getJSONObject(i)
            val wordsList = mutableListOf<String>()
            val wordsArr = scObj.optJSONArray("words")
            if (wordsArr != null) {
                for (w in 0 until wordsArr.length()) {
                    wordsList.add(wordsArr.getString(w))
                }
            }
            scrambleList.add(SentenceScrambleModel(
                id = scObj.optString("id", "sc-$i"),
                prompt = scObj.optString("prompt", ""),
                sentence = scObj.optString("sentence", ""),
                words = wordsList,
                hint = scObj.optString("hint", "")
            ))
        }

        // Parse Audio Detective Pool
        val detectiveList = mutableListOf<AudioDetectiveModel>()
        val detArray = root.optJSONArray("audioDetectivePool") ?: JSONArray()
        for (i in 0 until detArray.length()) {
            val dObj = detArray.getJSONObject(i)
            detectiveList.add(AudioDetectiveModel(
                id = dObj.optString("id", "ad-$i"),
                word = dObj.optString("word", ""),
                audioWord = dObj.optString("audioWord", ""),
                optionA = dObj.optString("optionA", ""),
                optionB = dObj.optString("optionB", ""),
                correctOption = dObj.optString("correctOption", ""),
                hint = dObj.optString("hint", ""),
                explanation = dObj.optString("explanation", "")
            ))
        }

        // Parse Roleplays
        val roleplaysList = mutableListOf<RoleplayModel>()
        val rpArray = root.optJSONArray("roleplays") ?: JSONArray()
        for (i in 0 until rpArray.length()) {
            val rpObj = rpArray.getJSONObject(i)
            val stepsList = mutableListOf<RoleplayStepModel>()
            val stepsArr = rpObj.optJSONArray("steps") ?: JSONArray()

            for (s in 0 until stepsArr.length()) {
                val stepObj = stepsArr.getJSONObject(s)
                val optsList = mutableListOf<RoleplayOptionModel>()
                val optsArr = stepObj.optJSONArray("userOptions") ?: JSONArray()
                for (o in 0 until optsArr.length()) {
                    val optObj = optsArr.getJSONObject(o)
                    optsList.add(RoleplayOptionModel(
                        textEn = optObj.optString("textEn", ""),
                        textEs = optObj.optString("textEs", ""),
                        isAppropriate = optObj.optBoolean("isAppropriate", true),
                        feedback = optObj.optString("feedback", "")
                    ))
                }
                stepsList.add(RoleplayStepModel(
                    speaker = stepObj.optString("speaker", "Assistant"),
                    textEn = stepObj.optString("textEn", ""),
                    textEs = stepObj.optString("textEs", ""),
                    userOptions = optsList
                ))
            }

            roleplaysList.add(RoleplayModel(
                id = rpObj.optString("id", "rp-$i"),
                title = rpObj.optString("title", "Conversación"),
                description = rpObj.optString("description", ""),
                icon = rpObj.optString("icon", "🎭"),
                context = rpObj.optString("context", ""),
                steps = stepsList
            ))
        }

        val curriculum = CurriculumData(
            units = unitsList,
            flashcards = flashcardsList,
            speedMatchPool = speedMatchList,
            roleplays = roleplaysList,
            sentenceScramblePool = scrambleList,
            audioDetectivePool = detectiveList
        )
        cachedCurriculum = curriculum
        return curriculum
    }
}
