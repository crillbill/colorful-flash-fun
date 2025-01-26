import { supabase } from "@/integrations/supabase/client";

interface WordEntry {
  english: string;
  hebrew: string;
  transliteration: string;
}

const wordsList: WordEntry[] = [
  { english: "dad", hebrew: "אבא", transliteration: "a-ba" },
  { english: "watermelon", hebrew: "אבטיח", transliteration: "a-va-ti-akh" },
  { english: "Spring", hebrew: "אביב", transliteration: "a-viv" },
  { english: "but", hebrew: "אבל", transliteration: "a-val" },
  { english: "thumb", hebrew: "אגודל", transliteration: "a-gu-dal" },
  { english: "walnut", hebrew: "אגוז מלך", transliteration: "e-goz me-lekh" },
  { english: "pear", hebrew: "אגס", transliteration: "a-gas" },
  { english: "red", hebrew: "אדום", transliteration: "a-dom" },
  { english: "or", hebrew: "או", transliteration: "o" },
  { english: "ear", hebrew: "אוזן", transliteration: "o-zen" },
  { english: "bus", hebrew: "אוטובוס", transliteration: "o-to-bus" },
  { english: "food", hebrew: "אוכל", transliteration: "o-khel" },
  { english: "maybe", hebrew: "אולי", transliteration: "u-lai" },
  { english: "university", hebrew: "אוניברסיטה", transliteration: "u-ni-ver-si-ta" },
  { english: "bicycle", hebrew: "אופניים", transliteration: "o-fa-na-yim" },
  { english: "rice", hebrew: "אורז", transliteration: "o-rez" },
  { english: "so, then", hebrew: "אז", transliteration: "az" },
  { english: "brother", hebrew: "אח", transliteration: "akh" },
  { english: "sister", hebrew: "אחות", transliteration: "a-khot" },
  { english: "last, final", hebrew: "אחרון", transliteration: "a-kha-ron" },
  { english: "which", hebrew: "איזה", transliteration: "ei-ze" },
  { english: "slow", hebrew: "איטי", transliteration: "i-ti" },
  { english: "how", hebrew: "איך", transliteration: "eikh" },
  { english: "mom", hebrew: "אימא", transliteration: "i-ma" },
  { english: "there isn’t/aren’t", hebrew: "אין", transliteration: "ein" },
  { english: "where", hebrew: "איפה", transliteration: "ei-fo" },
  { english: "wife", hebrew: "אישה", transliteration: "i-sha" },
  { english: "if", hebrew: "אם", transliteration: "im" },
  { english: "English", hebrew: "אנגלית", transliteration: "an-glit" },
  { english: "we", hebrew: "אנחנו", transliteration: "a-nakh-nu" },
  { english: "I", hebrew: "אני", transliteration: "a-ni" },
  { english: "pineapple", hebrew: "אננס", transliteration: "a-na-nas" },
  { english: "forbidden", hebrew: "אסור", transliteration: "a-sur" },
  { english: "nose", hebrew: "אף", transliteration: "af" },
  { english: "peach", hebrew: "אפרסק", transliteration: "a-far-sek" },
  { english: "(it is) possible", hebrew: "אפשר", transliteration: "ef-shar" },
  { english: "finger, toe", hebrew: "אצבע", transliteration: "ets-ba" },
  { english: "breakfast", hebrew: "ארוחת בוקר", transliteration: "a-ru-khat bo-ker" },
  { english: "dinner", hebrew: "ארוחת ערב", transliteration: "a-ru-khat e-rev" },
  { english: "lunch", hebrew: "ארוחת צהריים", transliteration: "a-ru-khat tso-ho-ra-yim" },
  { english: "wallet", hebrew: "ארנק", transliteration: "ar-nak" },
  { english: "grapefruit", hebrew: "אשכולית", transliteration: "esh-ko-lit" },
  { english: "you (f.)", hebrew: "את", transliteration: "את" },
  { english: "you (m.)", hebrew: "אתה", transliteration: "a-ta" },
  { english: "you (m.p.)", hebrew: "אתם", transliteration: "a-tem" },
  { english: "yesterday", hebrew: "אתמול", transliteration: "et-mol" },
  { english: "you (f.p.)", hebrew: "אתן", transliteration: "a-ten" },
  { english: "in, at", hebrew: "ב...", transliteration: "be, ba" },
  { english: "please", hebrew: "בבקשה", transliteration: "be-va-ka-sha" },
  { english: "clothes", hebrew: "בגדים", transliteration: "be-ga-dim" },
  { english: "good luck", hebrew: "בהצלחה", transliteration: "be-hats-la-kha" },
  { english: "morning", hebrew: "בוקר", transliteration: "bo-ker" },
  { english: "outside", hebrew: "בחוץ", transliteration: "ba-khuts" },
  { english: "sweet potato", hebrew: "בטטה", transliteration: "ba-ta-ta" },
  { english: "stomach/abdomen/tummy", hebrew: "בטן", transliteration: "be-ten" },
  { english: "together", hebrew: "ביחד", transliteration: "be-ya-khad" },
  { english: "medium", hebrew: "בינוני", transliteration: "bei-no-ni" },
  { english: "egg", hebrew: "ביצה", transliteration: "bei-tsa" },
  { english: "beer", hebrew: "בירה", transliteration: "bi-ra" },
  { english: "house", hebrew: "בית", transliteration: "ba-yit" },
  { english: "hospital", hebrew: "בית חולים", transliteration: "beit kho-lim" },
  { english: "synagogue", hebrew: "בית כנסת", transliteration: "beit kne-set" },
  { english: "pharmacy", hebrew: "בית מרקחת", transliteration: "beit mir-ka-khat" },
  { english: "school", hebrew: "בית ספר", transliteration: "beit se-fer" },
  { english: "without", hebrew: "בלי", transliteration: "bli" },
  { english: "son", hebrew: "בן", transliteration: "ben" },
  { english: "cousin", hebrew: "בן דוד", transliteration: "ben dod" },
  { english: "gasoline", hebrew: "בנזין", transliteration: "ben-zin" },
  { english: "building", hebrew: "בניין", transliteration: "bin-yan" },
  { english: "banana", hebrew: "בננה", transliteration: "ba-na-na" },
  { english: "bank", hebrew: "בנק", transliteration: "bank" },
  { english: "okay", hebrew: "בסדר", transliteration: "be-se-der" },
  { english: "husband", hebrew: "בעל", transliteration: "ba-al" },
  { english: "inside", hebrew: "בפנים", transliteration: "bif-nim" },
  { english: "onion", hebrew: "בצל", transliteration: "ba-tsal" },
  { english: "bottle", hebrew: "בקבוק", transliteration: "bak-buk" },
  { english: "beef", hebrew: "בקר", transliteration: "ba-kar" },
  { english: "soon", hebrew: "בקרוב", transliteration: "be-ka-rov" },
  { english: "healthy", hebrew: "בריא", transliteration: "ba-ri" },
  { english: "meat", hebrew: "בשר", transliteration: "ba-sar" },
  { english: "daughter", hebrew: "בת", transliteration: "bat" },
  { english: "cockroach", hebrew: "ג'וק", transliteration: "juk" },
  { english: "back", hebrew: "גב", transliteration: "gav" },
  { english: "high", hebrew: "גבוה", transliteration: "ga-vo-ha" },
  { english: "cheese", hebrew: "גבינה", transliteration: "gvi-na" },
  { english: "big", hebrew: "גדול", transliteration: "ga-dol" },
  { english: "height", hebrew: "גובה", transliteration: "go-va" },
  { english: "body", hebrew: "גוף", transliteration: "guf" },
  { english: "carrot", hebrew: "גזר", transliteration: "ge-zer" },
  { english: "ice cream", hebrew: "גלידה", transliteration: "gli-da" },
  { english: "also", hebrew: "גם", transliteration: "gam" },
  { english: "socks", hebrew: "גרביים", transliteration: "gar-ba-yim" },
  { english: "rain", hebrew: "גשם", transliteration: "ge-shem" },
  { english: "honey", hebrew: "דבש", transliteration: "dvash" },
  { english: "fish", hebrew: "דג", transliteration: "dag" },
  { english: "mail; post office", hebrew: "דואר", transliteration: "do-ar" },
  { english: "cherry", hebrew: "דובדבן", transliteration: "duv-de-van" },
  { english: "uncle", hebrew: "דוד", transliteration: "dod" },
  { english: "aunt", hebrew: "דודה", transliteration: "do-da" },
  { english: "apartment", hebrew: "דירה", transliteration: "di-ra" },
  { english: "door", hebrew: "דלת", transliteration: "de-let" },
  { english: "minute", hebrew: "דקה", transliteration: "da-ka" },
  { english: "South", hebrew: "דרום", transliteration: "da-rom" },
  { english: "passport", hebrew: "דרכון", transliteration: "dar-kon" },
  { english: "religious", hebrew: "דתי", transliteration: "da-ti" },
  { english: "the", hebrew: "ה...", transliteration: "ha" },
  { english: "next", hebrew: "הבא", transliteration: "ha-ba" },
  { english: "he", hebrew: "הוא", transliteration: "hu" },
  { english: "turkey (animal)", hebrew: "הודו", transliteration: "ho-du" },
  { english: "present (tense)", hebrew: "הווה", transliteration: "ho-ve" },
  { english: "parents", hebrew: "הורים", transliteration: "ho-rim" },
  { english: "she", hebrew: "היא", transliteration: "hi" },
  { english: "today", hebrew: "היום", transliteration: "ha-yom" },
  { english: "they (m.)", hebrew: "הם", transliteration: "hem" },
  { english: "they (f.)", hebrew: "הן", transliteration: "hen" },
  { english: "break", hebrew: "הפסקה", transliteration: "haf-sa-ka" },
  { english: "a lot", hebrew: "הרבה", transliteration: "har-be" },
  { english: "exercise", hebrew: "התעמלות", transliteration: "hit-am-lut" },
  { english: "and", hebrew: "ו...", transliteration: "ve" },
  { english: "this", hebrew: "זה", transliteration: "ze" },
  { english: "cheap", hebrew: "זול", transliteration: "zol" },
  { english: "olive", hebrew: "זית", transliteration: "za-yit" },
  { english: "time", hebrew: "זמן", transliteration: "zman" },
  { english: "old (person)", hebrew: "זקן", transliteration: "za-ken" },
  { english: "friend", hebrew: "חבר", transliteration: "kha-ver" },
  { english: "company", hebrew: "חברה", transliteration: "khev-ra" },
  { english: "holiday", hebrew: "חג", transliteration: "khag" },
  { english: "belt", hebrew: "חגורה", transliteration: "kha-go-ra" },
  { english: "room", hebrew: "חדר", transliteration: "khe-der" },
  { english: "new", hebrew: "חדש", transliteration: "kha-dash" },
  { english: "news", hebrew: "חדשות", transliteration: "kha-da-shot" },
  { english: "month", hebrew: "חודש", transliteration: "kho-desh" },
  { english: "sick", hebrew: "חולה", transliteration: "kho-le" },
  { english: "shirt", hebrew: "חולצה", transliteration: "khul-tsa" },
  { english: "brown", hebrew: "חום", transliteration: "khum" },
  { english: "hummus", hebrew: "חומוס", transliteration: "khu-mus" },
  { english: "beach", hebrew: "חוף", transliteration: "khof" },
  { english: "vacation", hebrew: "חופשה", transliteration: "khuf-sha" },
  { english: "Winter", hebrew: "חורף", transliteration: "kho-ref" },
  { english: "chest", hebrew: "חזה", transliteration: "kha-ze" },
  { english: "strong", hebrew: "חזק", transliteration: "kha-zak" },
  { english: "milk", hebrew: "חלב", transliteration: "kha-lav" },
  { english: "challah", hebrew: "חלה", transliteration: "kha-la" },
  { english: "window", hebrew: "חלון", transliteration: "kha-lon" },
  { english: "secular", hebrew: "חלוני", transliteration: "khi-lo-ni" },
  { english: "hot", hebrew: "חם", transliteration: "kham" },
  { english: "butter", hebrew: "חמאה", transliteration: "khem-a" },
  { english: "pickles", hebrew: "חמוצים", transliteration: "kha-mu-tsim" },
  { english: "store", hebrew: "חנות", transliteration: "kha-nut" },
  { english: "lettuce", hebrew: "חסה", transliteration: "kha-sa" },
  { english: "skirt", hebrew: "חצאית", transliteration: "kha-tsa-it" },
  { english: "half (of something)", hebrew: "חצי", transliteration: "khe-tsi" },
  { english: "spicy (hot)", hebrew: "חריף", transliteration: "kha-rif" },
  { english: "bill, check", hebrew: "חשבון", transliteration: "khesh-bon" },
  { english: "important", hebrew: "חשוב", transliteration: "kha-shuv" },
  { english: "cat", hebrew: "חתול", transliteration: "kha-tul" },
  { english: "good", hebrew: "טוב", transliteration: "tov" },
  { english: "trip, hike", hebrew: "טיול", transliteration: "ti-yul" },
  { english: "lamb", hebrew: "טלה", transliteration: "ta-le" },
  { english: "tv", hebrew: "טלוויזיה", transliteration: "te-le-viz-ya" },
  { english: "telephone", hebrew: "טלפון", transliteration: "te-le-fon" },
  { english: "tasty", hebrew: "טעים", transliteration: "ta-im" },
  { english: "get going", hebrew: "יאללה", transliteration: "ya-la" },
  { english: "arm", hebrew: "יד", transliteration: "yad" },
  { english: "Jewish", hebrew: "יהודי", transliteration: "ye-hu-di" },
  { english: "yogurt", hebrew: "יוגורט", transliteration: "yo-gurt" },
  { english: "day", hebrew: "יום", transliteration: "yom" },
  { english: "Thursday", hebrew: "יום חמישי", transliteration: "yom kha-mi-shi" },
  { english: "Sunday", hebrew: "יום ראשון", transliteration: "yom ri-shon" },
  { english: "Wednesday", hebrew: "יום רביעי", transliteration: "yom re-vi-i" },
  { english: "Tuesday", hebrew: "יום שלישי", transliteration: "yom shli-shi" },
  { english: "Monday", hebrew: "יום שני", transliteration: "yom she-ni" },
  { english: "Friday", hebrew: "יום שישי", transliteration: "yom shi-shi" },
  { english: "singular; single (not married)", hebrew: "יחיד", transliteration: "ya-khid" },
  { english: "wine", hebrew: "יין", transliteration: "ya-yin" },
  { english: "boy", hebrew: "ילד", transliteration: "ye-led" },
  { english: "girl", hebrew: "ילדה", transliteration: "yal-da" },
  { english: "sea", hebrew: "ים", transliteration: "yam" },
  { english: "right (direction)", hebrew: "ימינה", transliteration: "ya-mi-na" },
  { english: "beautiful", hebrew: "יפה", transliteration: "ya-fe" },
  { english: "exit", hebrew: "יציאה", transliteration: "ye-tsi-a" },
  { english: "expensive", hebrew: "יקר", transliteration: "ya-kar" },
  { english: "green", hebrew: "ירוק", transliteration: "ya-rok" },
  { english: "moon", hebrew: "ירח", transliteration: "ya-re-akh" },
  { english: "vegetables", hebrew: "ירקות", transliteration: "ye-ra-kot" },
  { english: "there is/are", hebrew: "יש", transliteration: "yesh" },
  { english: "old (thing)", hebrew: "ישן", transliteration: "ya-shan" },
  { english: "straight ahead; honest", hebrew: "ישר", transliteration: "ya-shar" },
  { english: "Israel", hebrew: "ישראל", transliteration: "is-ra-el" },
  { english: "mosquito", hebrew: "יתוש", transliteration: "ya-tush" },
  { english: "as", hebrew: "כ...", transliteration: "ke" },
  { english: "pain/ache", hebrew: "כאב", transliteration: "ke-ev" },
  { english: "road, route", hebrew: "כביש", transliteration: "kvish" },
  { english: "ball", hebrew: "כדור", transliteration: "ka-dur" },
  { english: "soccer", hebrew: "כדורגל", transliteration: "ka-du-re-gel" },
  { english: "basketball", hebrew: "כדורסל", transliteration: "ka-dur-sal" },
  { english: "hat", hebrew: "כובע", transliteration: "ko-va" },
  { english: "star", hebrew: "כוכב", transliteration: "ko-khav" },
  { english: "glass, cup", hebrew: "כוס", transliteration: "kos" },
  { english: "angry", hebrew: "כועס", transliteration: "ko-es" },
  { english: "blue", hebrew: "כחול", transliteration: "ka-khol" },
  { english: "chair", hebrew: "כיסא", transliteration: "ki-se" },
  { english: "classroom", hebrew: "כיתה", transliteration: "ki-ta" },
  { english: "all", hebrew: "כל", transliteration: "kol" },
  { english: "dog", hebrew: "כלב", transliteration: "ke-lev" },
  { english: "nothing", hebrew: "כלום", transliteration: "klum" },
  { english: "how much", hebrew: "כמה", transliteration: "ka-ma (or ka-ma)" },
  { english: "yes", hebrew: "כן", transliteration: "ken" },
  { english: "entrance", hebrew: "כניסה", transliteration: "kni-sa" },
  { english: "money", hebrew: "כסף", transliteration: "ke-sef" },
  { english: "ATM", hebrew: "כספומט", transliteration: "kas-po-mat" },
  { english: "spoon", hebrew: "כף", transliteration: "kaf" },
  { english: "hand", hebrew: "כף יד", transliteration: "kaf yad" },
  { english: "foot", hebrew: "כף רגל", transliteration: "kaf re-gel" },
  { english: "cabbage", hebrew: "כרוב", transliteration: "kruv" },
  { english: "pillow", hebrew: "כרית", transliteration: "ka-rit" },
  { english: "kosher", hebrew: "כשר", transliteration: "ka-sher" },
  { english: "address", hebrew: "כתובת", transliteration: "ktov-et" },
  { english: "orange (color)", hebrew: "כתום", transliteration: "ka-tom" },
  { english: "to, for", hebrew: "ל...", transliteration: "le" },
  { english: "no", hebrew: "לא", transliteration: "lo" },
  { english: "slowly", hebrew: "לאט", transliteration: "le-at" },
  { english: "heart", hebrew: "לב", transliteration: "lev" },
  { english: "alone", hebrew: "לבד", transliteration: "le-vad" },
  { english: "white", hebrew: "לבן", transliteration: "la-van" },
  { english: "bless you (after s.o. sneezes)", hebrew: "לבריאות", transliteration: "liv-ri-ut" },
  { english: "see you later", hebrew: "להתראות", transliteration: "le-hit-ra-ot" },
  { english: "Cheers!", hebrew: "לחיים!", transliteration: "le-kha-yim" },
  { english: "bread", hebrew: "לחם", transliteration: "le-khem" },
  { english: "lizard", hebrew: "לטאה", transliteration: "le-ta-a" },
  { english: "night", hebrew: "לילה", transliteration: "lai-la" },
  { english: "lemon", hebrew: "לימון", transliteration: "li-mon" },
  { english: "why", hebrew: "למה", transliteration: "la-ma" },
  { english: "down", hebrew: "למטה", transliteration: "le-ma-ta" },
  { english: "up", hebrew: "למעלה", transliteration: "le-ma-la" },
  { english: "before", hebrew: "לפני", transliteration: "lif-nei" },
  { english: "from", hebrew: "מ...", transliteration: "me" },
  { english: "very", hebrew: "מאוד", transliteration: "me-od" },
  { english: "late", hebrew: "מאוחר", transliteration: "me-u-khar" },
  { english: "pastry", hebrew: "מאפה", transliteration: "ma-a-fe" },
  { english: "bakery", hebrew: "מאפייה", transliteration: "ma-a-fi-ya" },
  { english: "test/exam", hebrew: "מבחן", transliteration: "miv-khan" },
  { english: "towel", hebrew: "מגבת", transliteration: "ma-ge-vet" },
  { english: "desert", hebrew: "מדבר", transliteration: "mid-bar" },
  { english: "country", hebrew: "מדינה", transliteration: "me-di-na" },
  { english: "scientist", hebrew: "מדען", transliteration: "mad-an" },
  { english: "printer", hebrew: "מדפסת", transliteration: "mad-pe-set" },
  { english: "sidewalk", hebrew: "מדרכה", transliteration: "mid-ra-kha" },
  { english: "what", hebrew: "מה", transliteration: "ma" },
  { english: "fast", hebrew: "מהיר", transliteration: "ma-hir" },
  { english: "engineer", hebrew: "מהנדס", transliteration: "me-han-des" },
  { english: "quickly", hebrew: "מהר", transliteration: "ma-her" },
  { english: "museum", hebrew: "מוזיאון", transliteration: "mu-zei-on" },
  { english: "music", hebrew: "מוזיקה", transliteration: "mu-zi-ka" },
  { english: "brain", hebrew: "מוח", transliteration: "mo-akh" },
  { english: "ready", hebrew: "מוכן", transliteration: "mu-khan" },
  { english: "taxi", hebrew: "מונית", transliteration: "mo-nit" },
  { english: "early", hebrew: "מוקדם", transliteration: "muk-dam" },
  { english: "teacher", hebrew: "מורה", transliteration: "mo-re, mo-ra" },
  { english: "weather", hebrew: "מזג אוויר", transliteration: "me-zeg a-vir" },
  { english: "air conditioner", hebrew: "מזגן", transliteration: "maz-gan" },
  { english: "fork", hebrew: "מזלג", transliteration: "maz-leg" },
  { english: "East", hebrew: "מזרח", transliteration: "miz-rakh" },
  { english: "notebook", hebrew: "מחברת", transliteration: "makh-be-ret" },
  { english: "tomorrow", hebrew: "מחר", transliteration: "ma-khar" },
  { english: "computer", hebrew: "מחשב", transliteration: "makh-shev" },
  { english: "kitchen", hebrew: "מטבח", transliteration: "mit-bakh" },
  { english: "fried", hebrew: "מטוגן", transliteration: "me-tu-gan" },
  { english: "airplane", hebrew: "מטוס", transliteration: "ma-tos" },
  { english: "meter", hebrew: "מטר", transliteration: "me-ter" },
  { english: "who", hebrew: "מי", transliteration: "mi" },
  { english: "bed", hebrew: "מיטה", transliteration: "mi-ta" },
  { english: "dictionary", hebrew: "מילון", transliteration: "mi-lon" },
  { english: "water", hebrew: "מים", transliteration: "ma-yim" },
  { english: "juice", hebrew: "מיץ", transliteration: "mits" },
  { english: "microwave", hebrew: "מיקרוגל", transliteration: "mik-ro-gal" },
  { english: "someone", hebrew: "מישהו", transliteration: "mi-she-hu" },
  { english: "car", hebrew: "מכונית", transliteration: "me-kho-nit" },
  { english: "ugly", hebrew: "מכוער", transliteration: "me-kho-ar" },
  { english: "pants", hebrew: "מכנסים", transliteration: "mikh-na-sa-yim" },
  { english: "shorts", hebrew: "מכנסים קצרים", transliteration: "mikh-na-sa-yim k-tsar-im" },
  { english: "full", hebrew: "מלא", transliteration: "ma-le" },
  { english: "exciting", hebrew: "מלהיב", transliteration: "mal-hiv" },
  { english: "hotel", hebrew: "מלון", transliteration: "ma-lon" },
  { english: "salt", hebrew: "מלח", transliteration: "me-lakh" },
  { english: "cucumber", hebrew: "מלפפון", transliteration: "me-la-fe-fon" },
  { english: "government", hebrew: "ממשלה", transliteration: "mem-sha-la" },
  { english: "mango", hebrew: "מנגו", transliteration: "man-go" },
  { english: "serving/portion", hebrew: "מנה", transliteration: "ma-na" },
  { english: "manager", hebrew: "מנהל", transliteration: "me-na-hel" },
  { english: "tunnel", hebrew: "מנהרה", transliteration: "min-ha-ra" },
  { english: "restaurant", hebrew: "מסעדה", transliteration: "mis-a-da" },
  { english: "number", hebrew: "מספר", transliteration: "mis-par" },
  { english: "smelly", hebrew: "מסריח", transliteration: "mas-ri-akh" },
  { english: "interesting", hebrew: "מעניין", transliteration: "me-an-yen" },
  { english: "West", hebrew: "מערב", transliteration: "ma-a-rav" },
  { english: "napkin", hebrew: "מפית", transliteration: "map-it" },
  { english: "key", hebrew: "מפתח", transliteration: "maf-te-akh" },
  { english: "excellent", hebrew: "מצוין", transliteration: "me-tsu-yan" },
  { english: "funny", hebrew: "מצחיק", transliteration: "mats-khik" },
  { english: "camera", hebrew: "מצלמה", transliteration: "mats-le-ma" },
  { english: "place", hebrew: "מקום", transliteration: "ma-kom" },
  { english: "refrigerator", hebrew: "מקרר", transliteration: "me-ka-rer" },
  { english: "soup", hebrew: "מרק", transliteration: "ma-rak" },
  { english: "something", hebrew: "משהו", transliteration: "ma-she-hu" },
  { english: "game", hebrew: "משחק", transliteration: "mis-khak" },
  { english: "police", hebrew: "משטרה", transliteration: "mish-ta-ra" },
  { english: "boring", hebrew: "משעמם", transliteration: "me-sha-a-mem" },
  { english: "family", hebrew: "משפחה", transliteration: "mish-pa-kha" },
  { english: "weight", hebrew: "משקל", transliteration: "mish-kal" },
  { english: "office", hebrew: "משרד", transliteration: "mis-rad" },
  { english: "sweet", hebrew: "מתוק", transliteration: "ma-tok" },
  { english: "when", hebrew: "מתי", transliteration: "ma-tai" },
  { english: "intelligent", hebrew: "נבון", transliteration: "na-von" },
  { english: "driver", hebrew: "נהג", transliteration: "na-hag" },
  { english: "river", hebrew: "נהר", transliteration: "na-har" },
  { english: "paper", hebrew: "נייר", transliteration: "ni-yar" },
  { english: "correct", hebrew: "נכון", transliteration: "na-khon" },
  { english: "low", hebrew: "נמוך", transliteration: "na-mukh" },
  { english: "airport", hebrew: "נמל תעופה", transliteration: "na-mal te-u-fa" },
  { english: "ant", hebrew: "נמלה", transliteration: "ne-ma-la" },
  { english: "shoes", hebrew: "נעליים", transliteration: "na-a-la-yim" },
  { english: "nectarine", hebrew: "נקטרינה", transliteration: "nek-ta-ri-na" },
  { english: "clean", hebrew: "נקי", transliteration: "na-ki" },
  { english: "married", hebrew: "נשוי", transliteration: "na-su-i" },
  { english: "weapon", hebrew: "נשק", transliteration: "ne-shek" },
  { english: "grandfather", hebrew: "סבא", transliteration: "sa-ba" },
  { english: "soap", hebrew: "סבון", transliteration: "sa-bon" },
  { english: "grandmother", hebrew: "סבתא", transliteration: "sav-ta" },
  { english: "purple", hebrew: "סגול", transliteration: "sa-gol" },
  { english: "closed", hebrew: "סגור", transliteration: "sa-gur" },
  { english: "sheet", hebrew: "סדין", transliteration: "sa-din" },
  { english: "sugar", hebrew: "סוכר", transliteration: "su-kar" },
  { english: "end", hebrew: "סוף", transliteration: "sof" },
  { english: "weekend", hebrew: "סוף שבוע", transliteration: "sof sha-vu-a" },
  { english: "supermarket", hebrew: "סופרמרקט", transliteration: "su-per-mar-ket" },
  { english: "student", hebrew: "סטודנט", transliteration: "stu-dent" },
  { english: "story", hebrew: "סיפור", transliteration: "si-pur" },
  { english: "knife", hebrew: "סכין", transliteration: "sa-kin" },
  { english: "salad", hebrew: "סלט", transliteration: "sa-lat" },
  { english: "excuse me", hebrew: "סליחה", transliteration: "sli-kha" },
  { english: "beet(root)", hebrew: "סלק", transliteration: "se-lek" },
  { english: "sandals", hebrew: "סנדלים", transliteration: "san-da-lim" },
  { english: "sofa", hebrew: "ספה", transliteration: "sa-pa" },
  { english: "sport", hebrew: "ספורט", transliteration: "sport" },
  { english: "book", hebrew: "ספר", transliteration: "se-fer" },
  { english: "library", hebrew: "ספרייה", transliteration: "sif-ri-ya" },
  { english: "movie", hebrew: "סרט", transliteration: "se-ret" },
  { english: "Fall", hebrew: "סתיו", transliteration: "stav" },
  { english: "past", hebrew: "עבר", transliteration: "a-var" },
  { english: "Hebrew", hebrew: "עברית", transliteration: "iv-rit" },
  { english: "tomato", hebrew: "עגבניה", transliteration: "ag-va-ni-ya" },
  { english: "mold", hebrew: "עובש", transliteration: "o-vesh" },
  { english: "cake", hebrew: "עוגה", transliteration: "u-ga" },
  { english: "world", hebrew: "עולם", transliteration: "o-lam" },
  { english: "chicken", hebrew: "עוף", transliteration: "of" },
  { english: "pen", hebrew: "עט", transliteration: "et" },
  { english: "tired", hebrew: "עייף", transliteration: "a-yef" },
  { english: "eye", hebrew: "עין", transliteration: "a-yin" },
  { english: "city", hebrew: "עיר", transliteration: "ir" },
  { english: "newspaper", hebrew: "עיתון", transliteration: "i-ton" },
  { english: "spider", hebrew: "עכביש", transliteration: "a-ka-vish" },
  { english: "now", hebrew: "עכשיו", transliteration: "akh-shav" },
  { english: "on, about", hebrew: "על", transliteration: "al" },
  { english: "grapes", hebrew: "ענבים", transliteration: "a-na-vim" },
  { english: "poor", hebrew: "עני", transliteration: "a-ni" },
  { english: "cloud", hebrew: "ענן", transliteration: "a-nan" },
  { english: "pencil", hebrew: "עפרון", transliteration: "i-pa-ron" },
  { english: "tree, wood", hebrew: "עץ", transliteration: "ets" },
  { english: "stop", hebrew: "עצור", transliteration: "a-tsor" },
  { english: "lazy", hebrew: "עצלן", transliteration: "ats-lan" },
  { english: "bone", hebrew: "עצם", transliteration: "e-tsem" },
  { english: "evening", hebrew: "ערב", transliteration: "e-rev" },
  { english: "Arabic", hebrew: "ערבית", transliteration: "a-ra-vit" },
  { english: "channel (tv)", hebrew: "ערוץ", transliteration: "a-ruts" },
  { english: "rich", hebrew: "עשיר", transliteration: "a-shir" },
  { english: "future", hebrew: "עתיד", transliteration: "a-tid" },
  { english: "mouth", hebrew: "פה", transliteration: "pe" },
  { english: "here", hebrew: "פה", transliteration: "po" },
  { english: "garbage can", hebrew: "פח אשפה", transliteration: "pakh ash-pa" },
  { english: "parsley", hebrew: "פטרוזיליה", transliteration: "pet-ro-zil-ya" },
  { english: "mushrooms", hebrew: "פטריות", transliteration: "pit-ri-yot" },
  { english: "smart", hebrew: "פיקח", transliteration: "pi-ke-akh" },
  { english: "pita", hebrew: "פיתה", transliteration: "pi-ta" },
  { english: "falafel", hebrew: "פלאפל", transliteration: "fa-la-fel" },
  { english: "pepper", hebrew: "פלפל", transliteration: "pil-pel" },
  { english: "face", hebrew: "פנים", transliteration: "pa-nim" },
  { english: "pasta", hebrew: "פסטה", transliteration: "pas-ta" },
  { english: "piano", hebrew: "פסנתר", transliteration: "psan-ter" },
  { english: "once", hebrew: "פעם", transliteration: "pa-am" },
  { english: "twice", hebrew: "פעמים", transliteration: "pa-a-ma-yim" },
  { english: "faculty", hebrew: "פקולטה", transliteration: "fa-kul-ta" },
  { english: "fruit", hebrew: "פרי", transliteration: "pri" },
  { english: "chapter", hebrew: "פרק", transliteration: "pe-rek" },
  { english: "simple", hebrew: "פשוט", transliteration: "pa-shut" },
  { english: "open", hebrew: "פתוח", transliteration: "pa-tu-akh" },
  { english: "color", hebrew: "צבע", transliteration: "tse-va" },
  { english: "I.D.F. (Israel Defense Forces)", hebrew: 'צה"ל', transliteration: "tsa-hal" },
  { english: "yellow", hebrew: "צהוב", transliteration: "tsa-hov" },
  { english: "noon", hebrew: "צהריים", transliteration: "tso-ho-ra-yim" },
  { english: "bird", hebrew: "ציפור", transliteration: "tsi-por" },
  { english: "plate", hebrew: "צלחת", transliteration: "tsa-la-khat" },
  { english: "North", hebrew: "צפון", transliteration: "tsa-fon" },
  { english: "team", hebrew: "קבוצה", transliteration: "kvu-tsa" },
  { english: "receipt", hebrew: "קבלה", transliteration: "ka-ba-la" },
  { english: "small", hebrew: "קטן", transliteration: "ka-tan" },
  { english: "quinoa", hebrew: "קינואה", transliteration: "ki-no-a" },
  { english: "Summer", hebrew: "קיץ", transliteration: "ka-yits" },
  { english: "wall", hebrew: "קיר", transliteration: "kir" },
  { english: "squash, zucchini", hebrew: "קישוא", transliteration: "ki-shu" },
  { english: "easy", hebrew: "קל", transliteration: "kal" },
  { english: "mall", hebrew: "קניון", transliteration: "kan-yon" },
  { english: "bowl", hebrew: "קערה", transliteration: "ke-a-ra" },
  { english: "coffee", hebrew: "קפה", transliteration: "ka-fe" },
  { english: "a little", hebrew: "קצת", transliteration: "k-tsat" },
  { english: "cold", hebrew: "קר", transliteration: "kar" },
  { english: "difficult", hebrew: "קשה", transliteration: "ka-she" },
  { english: "head", hebrew: "ראש", transliteration: "rosh" },
  { english: "first", hebrew: "ראשון", transliteration: "ri-shon" },
  { english: "rabbi", hebrew: "רב", transliteration: "rav" },
  { english: "quarter (of something)", hebrew: "רבע", transliteration: "re-va" },
  { english: "leg", hebrew: "רגל", transliteration: "re-gel" },
  { english: "moment", hebrew: "רגע", transliteration: "re-ga" },
  { english: "sauce", hebrew: "רוטב", transliteration: "ro-tev" },
  { english: "noisy", hebrew: "רועש", transliteration: "ro-esh" },
  { english: "doctor/physician", hebrew: "רופא", transliteration: "ro-fe" },
  { english: "thin", hebrew: "רזה", transliteration: "ra-ze" },
  { english: "street", hebrew: "רחוב", transliteration: "re-khov" },
  { english: "wet", hebrew: "רטוב", transliteration: "ra-tov" },
  { english: "pomegranate", hebrew: "רימון", transliteration: "ri-mon" },
  { english: "soft", hebrew: "רך", transliteration: "rakh" },
  { english: "train", hebrew: "רכבת", transliteration: "ra-ke-vet" },
  { english: "bad", hebrew: "רע", transliteration: "ra" },
  { english: "hungry", hebrew: "רעב", transliteration: "ra-ev" },
  { english: "idea", hebrew: "רעיון", transliteration: "ra-a-yon" },
  { english: "floor", hebrew: "רצפה", transliteration: "rits-pa" },
  { english: "only", hebrew: "רק", transliteration: "rak" },
  { english: "question", hebrew: "שאלה", transliteration: "she-e-la" },
  { english: "week", hebrew: "שבוע", transliteration: "sha-vu-a" },
  { english: "Saturday", hebrew: "שבת", transliteration: "sha-bat" },
  { english: "again", hebrew: "שוב", transliteration: "shuv" },
  { english: "shawarma", hebrew: "שווארמה", transliteration: "sha-war-ma" },
  { english: "table", hebrew: "שולחן", transliteration: "shul-khan" },
  { english: "garlic", hebrew: "שום", transliteration: "shum" },
  { english: "hot chocolate", hebrew: "שוקו חם", transliteration: "sho-ko kham" },
  { english: "chocolate", hebrew: "שוקולד", transliteration: "sho-ko-lad" },
  { english: "plum", hebrew: "שזיף", transliteration: "she-zif" },
  { english: "black", hebrew: "שחור", transliteration: "sha-khor" },
  { english: "swimming", hebrew: "שחייה", transliteration: "skhi-ya" },
  { english: "rug", hebrew: "שטיח", transliteration: "sha-ti-akh" },
  { english: "teeth", hebrew: "שיניים", transliteration: "shi-na-yim" },
  { english: "lesson", hebrew: "שיעור", transliteration: "shi-ur" },
  { english: "shuttle taxi", hebrew: "שירות", transliteration: "shei-rut" },
  { english: "neighborhood", hebrew: "שכונה", transliteration: "shkhu-na" },
  { english: "of", hebrew: "של", transliteration: "shel" },
  { english: "hello", hebrew: "שלום", transliteration: "sha-lom" },
  { english: "third (of something)", hebrew: "שליש", transliteration: "shlish" },
  { english: "whole", hebrew: "שלם", transliteration: "sha-lem" },
  { english: "there", hebrew: "שם", transliteration: "sham" },
  { english: "name", hebrew: "שם", transliteration: "shem" },
  { english: "surname", hebrew: "שם משפחה", transliteration: "shem mish-pa-kha" },
  { english: "first name", hebrew: "שם פרטי", transliteration: "shem pra-ti" },
  { english: "left (direction)", hebrew: "שמאלה", transliteration: "smo-la" },
  { english: "sky", hebrew: "שמיים", transliteration: "sha-ma-yim" },
  { english: "oil", hebrew: "שמן", transliteration: "she-men" },
  { english: "fat", hebrew: "שמן", transliteration: "sha-men" },
  { english: "sun", hebrew: "שמש", transliteration: "she-mesh" },
  { english: "year", hebrew: "שנה", transliteration: "sha-na" },
  { english: "second (time)", hebrew: "שניה", transliteration: "shni-ya" },
  { english: "schnitzel", hebrew: "שניצל", transliteration: "shni-tsel" },
  { english: "hour", hebrew: "שעה", transliteration: "sha-a" },
  { english: "clock", hebrew: "שעון", transliteration: "sha-on" },
  { english: "goal (soccer)", hebrew: "שער", transliteration: "sha-ar" },
  { english: "hair", hebrew: "שער", transliteration: "se-ar" },
  { english: "language", hebrew: "שפה", transliteration: "sa-fa" },
  { english: "almond", hebrew: "שקד", transliteration: "sha-ked" },
  { english: "quiet", hebrew: "שקט", transliteration: "she-ket" },
  { english: "shekel", hebrew: "שקל", transliteration: "she-kel" },
  { english: "shakshuka", hebrew: "שקשוקה", transliteration: "shak-shu-ka" },
  { english: "toilet (bathroom)", hebrew: "שרותים", transliteration: "she-ru-tim" },
  { english: "(a) drink", hebrew: "שתייה", transliteration: "shti-ya" },
  { english: "fig", hebrew: "תאנה", transliteration: "te-e-na" },
  { english: "date of birth", hebrew: "תאריך לידה", transliteration: "ta-a-rikh lei-da" },
  { english: "tea", hebrew: "תה", transliteration: "te" },
  { english: "thank you", hebrew: "תודה", transliteration: "to-da" },
  { english: "strawberry", hebrew: "תות", transliteration: "tut" },
  { english: "hobby", hebrew: "תחביב", transliteration: "takh-biv" },
  { english: "station, stop", hebrew: "תחנה", transliteration: "ta-kha-na" },
  { english: "baby", hebrew: "תינוק", transliteration: "ti-nok" },
  { english: "bag", hebrew: "תיק", transliteration: "tik" },
  { english: "picture", hebrew: "תמונה", transliteration: "tmu-na" },
  { english: "date (food)", hebrew: "תמר", transliteration: "ta-mar" },
  { english: "traffic", hebrew: "תנועה", transliteration: "tnu-a" },
  { english: "oven", hebrew: "תנור", transliteration: "ta-nur" },
  { english: "orange (food)", hebrew: "תפוז", transliteration: "ta-puz" },
  { english: "apple", hebrew: "תפוח", transliteration: "ta-pu-akh" },
  { english: "potato", hebrew: "תפוח אדמה", transliteration: "ta-pu-akh a-da-ma" },
  { english: "ceiling", hebrew: "תקרה", transliteration: "tik-ra" },
  { english: "spinach", hebrew: "תרד", transliteration: "te-red" }
];

export const importWords = async () => {
  console.log("Starting word import...");
  let successCount = 0;
  let errorCount = 0;

  for (const word of wordsList) {
    try {
      const { error } = await supabase
        .from('hebrew_content')
        .insert([
          {
            hebrew: word.hebrew,
            english: word.english,
            category: 'word'
          }
        ]);

      if (error) {
        console.error(`Error importing word ${word.english}:`, error);
        errorCount++;
      } else {
        successCount++;
      }
    } catch (err) {
      console.error(`Failed to import word ${word.english}:`, err);
      errorCount++;
    }
  }

  console.log(`Import completed. Successfully imported ${successCount} words. Failed to import ${errorCount} words.`);
  return { successCount, errorCount };
};
