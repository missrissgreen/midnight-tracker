local QUEST_IDS = {
    91281, 88719, 86769, 86770, 89271, 86780, 86805, 89012, 86806, 86807,
    91274, 86834, 86811, 86848, 86849, 86850, 86852, 86733, 86734, 86735,
    86737, 86738, 86739, 86740, 86741, 86742, 86743, 86744, 86745, 86621,
    86623, 86624, 90907, 86622, 86626, 86632, 90509, 90493, 90494, 86781,
    86634, 86633, 86635, 86636, 86637, 86638, 86639, 86640, 86641, 86642,
    86643, 86644, 86646, 86647, 86648, 86649, 86650, 90835, 90818, 90837,
    90819, 90821, 90822, 92021, 92022, 92023, 92024, 92025, 91271, 91090,
    91328, 91137, 87392, 87393, 87394, 87395, 87397, 87396, 87398, 90669,
    89199, 89200, 89201, 89202, 89203, 89204, 89205, 89206, 89207, 89208,
    89383, 89384, 89386, 89385, 94371, 91452, 91342, 91345, 91462, 91347,
    91348, 91463, 91349, 91350, 91384, 91383, 91385, 91386, 91388, 92408,
    91389, 87399, 87400, 87401, 87402, 92396, 92397, 92398, 90546, 90548,
    90549, 90550, 90551, 90552, 90570, 90553, 90554, 90555, 90556, 94393,
    91284, 91288, 91291, 91292, 91301, 92729, 92728, 92868, 92869, 92870,
    94396, 86997, 86998, 87002, 87455, 87456, 87457, 87458, 94388, 88977,
    88978, 88979, 90544, 94370, 91493, 91505, 91495, 91494, 91504, 89193,
    86837, 86838, 86839, 86840, 86841, 86842, 86843, 86844, 92136, 86902,
    86845, 91000, 86846, 89338, 86822, 86823, 86824, 86825, 91391, 86827,
    86826, 91842, 86828, 86831, 86830, 86829, 91726, 86832, 86833, 86903,
    91787, 86708, 86710, 90749, 86868, 86711, 86719, 86717, 86716, 86721,
    86712, 86718, 86715, 86720, 86722, 86723, 86652, 86653, 86655, 89334,
    86654, 86656, 86809, 86657, 86658, 86660, 86659, 92084, 86661, 86808,
    86663, 86664, 86665, 90772, 86666, 86681, 86682, 91958, 86683, 86684,
    86687, 86685, 86686, 91001, 86692, 86693, 91062, 91206, 87254, 87256,
    87267, 87268, 87317, 92531, 88986, 88987, 88988, 88989, 89230, 89231,
    89233, 93667, 90481, 90482, 90486, 90483, 90484, 90485, 90568, 92492,
    92493, 92495, 92496, 92497, 92499, 92163, 92164, 92165, 92166, 92167,
    93093, 93094, 93095, 93096, 93178, 93179, 93180, 93181, 93182, 91406,
    91407, 91403, 91404, 91405, 91408, 91630, 91409, 91411, 91412, 91410,
    91833, 91835, 91836, 91838, 91840, 91839, 89565, 89503, 89506, 89513,
    89559, 89560, 91813, 91747, 91748, 91749, 93734, 91750, 94867, 91069,
    91070, 91071, 91556, 92450, 92451, 92452, 92453, 93440, 93432, 93433,
    93435, 93436, 93437, 93257, 93258, 93259, 93260, 93261, 89402, 86899,
    86900, 86901, 86929, 86907, 86911, 90094, 90095, 86912, 86913, 86914,
    86956, 86910, 86973, 86942, 89034, 86944, 86930, 86864, 86836, 86855,
    86851, 86856, 86857, 86858, 86861, 86860, 86859, 86862, 86865, 86866,
    94677, 86882, 86867, 86881, 86880, 86877, 86890, 86883, 86885, 86884,
    86887, 86891, 86892, 86894, 86896, 86897, 86898, 90533, 90534, 90535,
    90467, 90468, 90469, 90470, 90474, 90537, 90540, 90569, 90963, 90601,
    90602, 91346, 91359, 91360, 91361, 91063, 91065, 91085, 91086, 91088,
    91136, 91550, 91551, 91552, 91553, 91585, 91586, 91587, 91588, 91589,
    91375, 91376, 91377, 91378, 91379, 91381, 91872, 91873, 91875, 91874,
    91876, 92882, 92883, 92884, 92885, 92694, 92695, 92696, 92697, 92864,
    92865, 92866, 92732, 92736, 92737, 92738, 92739, 90615, 90616, 90617,
    90619, 91450, 91270, 90620, 90621, 92616, 92617, 92618, 90622, 90824,
    90826, 90827, 90829, 90830, 90831, 90832, 90833, 90834, 91854, 91967, 91087, 91084,
    92061, 86543,
    86549, 86558, 86557, 86559, 86562, 86561, 86565, 86536, 86531, 86530,
    86528, 86538, 86537, 86539, 86540, 86541, 88768, 86542, 89249, 86544,
    86545, 86509, 86510, 90571, 86511, 86512, 86513, 86514, 86516, 86517,
    86515, 86518, 86519, 86520, 86521, 86522, 95276, 88755, 87388, 87391,
    88653, 87672, 88708, 91145, 91146, 91147, 91148, 91149, 92641, 90782,
    90866, 90872, 90873, 90874, 90875, 91343, 91341, 91340, 91339, 90910,
    91557, 91558, 91559, 91560, 91561, 93801, 91884, 91885, 91886, 91887,
    92390, 92155, 92156, 92157, 92158, 92159, 92603, 92604, 92605, 92606,
    92607, 91565, 91583, 91597, 91598, 91599, 91600, 91603, 91605, 91606,
    91694, 92657, 92658, 92659, 92660, 92661, 92662, 92939, 92946, 92944,
    92948, 90845, 90838, 90844, 90847, 90848, 90851, 90852, 93396, 90858,
    90860, 91545, 91546, 91544, 91963, 91543, 91542, 91541, 91537, 91536,
    91535, 91533, 90914, 90915, 90916, 90917, 90918, 90919, 90920, 90924,
    90922, 90923, 91363, 91380, 91382, 92505, 92506, 92507, 92508, 92509,
    92510, 92511, 92512, 90777, 88696, 88697, 88698, 88699, 91417, 88700,
    88701, 88702, 91426, 88703, 88704, 88705, 88706, 94957, 90690, 88709,
    90724, 92520, 88920, 88923, 88925, 88937, 88927, 88922, 88938, 88939,
    88941, 90746, 88769, 92689, 90876, 90871, 90861, 90862, 90867, 96410,
    96441, 96442, 96443, 96444,
}

local function Scan()
    local completed = {}
    for _, questID in ipairs(QUEST_IDS) do
        if C_QuestLog.IsQuestFlaggedCompleted(questID) then
            completed[#completed + 1] = questID
        end
    end
    return completed
end

local function SaveData(completed)
    MidnightTrackerData = {
        character = UnitName("player"),
        realm = GetRealmName(),
        scanTime = date("%Y-%m-%d %H:%M:%S"),
        completed = completed,
        totalChecked = #QUEST_IDS,
        totalCompleted = #completed,
    }
end

local frame = CreateFrame("Frame")
frame:RegisterEvent("PLAYER_LOGIN")
frame:SetScript("OnEvent", function()
    local completed = Scan()
    SaveData(completed)
    print("|cffE0B667[Midnight Tracker]|r Scanned " .. #QUEST_IDS ..
          " quests. |cff8FBE72" .. #completed .. " completed.|r Type |cffE0B667/mtrack|r to export.")
end)

local copyBox = nil

local function ShowExport(text)
    if copyBox then copyBox:Hide() end

    local f = CreateFrame("Frame", nil, UIParent, "BackdropTemplate")
    f:SetSize(500, 220)
    f:SetPoint("CENTER")
    f:SetBackdrop({
        bgFile = "Interface\\DialogFrame\\UI-DialogBox-Background",
        edgeFile = "Interface\\DialogFrame\\UI-DialogBox-Border",
        tile = true, tileSize = 32, edgeSize = 24,
        insets = { left = 6, right = 6, top = 6, bottom = 6 },
    })
    f:SetMovable(true)
    f:EnableMouse(true)
    f:RegisterForDrag("LeftButton")
    f:SetScript("OnDragStart", f.StartMoving)
    f:SetScript("OnDragStop", f.StopMovingOrSizing)
    f:SetFrameStrata("DIALOG")

    local title = f:CreateFontString(nil, "OVERLAY", "GameFontNormalLarge")
    title:SetPoint("TOP", 0, -12)
    title:SetText("|cffE0B667Midnight Tracker Export|r")

    local hint = f:CreateFontString(nil, "OVERLAY", "GameFontNormal")
    hint:SetPoint("TOP", 0, -34)
    hint:SetText("Select all (Cmd+A) and copy (Cmd+C), then paste into the web app.")

    local scroll = CreateFrame("ScrollFrame", nil, f, "UIPanelScrollFrameTemplate")
    scroll:SetPoint("TOPLEFT", 14, -58)
    scroll:SetPoint("BOTTOMRIGHT", -30, 40)

    local eb = CreateFrame("EditBox", nil, scroll)
    eb:SetMultiLine(true)
    eb:SetAutoFocus(true)
    eb:SetFontObject(ChatFontNormal)
    eb:SetWidth(430)
    eb:SetText(text)
    eb:HighlightText()
    scroll:SetScrollChild(eb)

    local close = CreateFrame("Button", nil, f, "UIPanelCloseButton")
    close:SetPoint("TOPRIGHT", -2, -2)
    close:SetScript("OnClick", function() f:Hide() end)

    f:Show()
    copyBox = f
end

SLASH_MIDNIGHTTRACKER1 = "/mtrack"
SlashCmdList["MIDNIGHTTRACKER"] = function(msg)
    local completed = Scan()
    SaveData(completed)

    if #completed == 0 then
        print("|cffE0B667[Midnight Tracker]|r No completed quests found out of " .. #QUEST_IDS .. " checked.")
        return
    end

    local csv = table.concat(completed, ",")
    print("|cffE0B667[Midnight Tracker]|r " .. #completed .. "/" .. #QUEST_IDS .. " quests completed.")
    ShowExport(csv)
end
