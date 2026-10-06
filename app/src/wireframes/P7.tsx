// GENERATED from wireframe P7-CarePlan.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #47698A; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"></path></svg>"
];

/** Care plan */
export default function WF_P7() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 14, paddingTop: 20, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P4b-HomeIdle.dc.html */}
            <SvgXml xml={SVG[0]} width={22} height={22} />
          </View>
          <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Care plan</Text>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 36, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> P7a-SitterRequirements.dc.html */}
            <SvgXml xml={SVG[1]} width={16} height={16} />
            <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A" }}>Requirements</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 4, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#E8ECF1", borderRadius: 12 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <View style={{ height: 38, backgroundColor: "#FFFFFF", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Tasks</Text></View>
            <View style={{ height: 38, backgroundColor: "transparent", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#4B5960" }}>Meals</Text></View>
            <View style={{ height: 38, backgroundColor: "transparent", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#4B5960" }}>Routines</Text></View>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 10, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 2, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#F6DCD6", borderRadius: 12 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#A1321F" }}>Leo · food to avoid</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#6E2215" }}>[Foods listed here appear on every shift]</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 4, paddingRight: 0, paddingBottom: 4, paddingLeft: 0 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Weekday after school</Text>
          <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#47698A", textDecorationLine: "underline" }}>Templates</Text></View>
        </View>
        <View style={{ flexDirection: "column", backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ width: 44, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#4B5960" }}>3:15</Text></View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Pick up Ava</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#6B7980" }}>Lincoln Elementary · alert on arrival</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 24, paddingTop: 0, paddingRight: 8, paddingBottom: 0, paddingLeft: 8, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#47698A" }}>Trip</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ width: 44, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#4B5960" }}>3:30</Text></View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Snack</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#6B7980" }}>Fruit and crackers</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 24, paddingTop: 0, paddingRight: 8, paddingBottom: 0, paddingLeft: 8, backgroundColor: "#F3E1E3", borderRadius: 999, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B2328" }}>Food</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ width: 44, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#4B5960" }}>4:10</Text></View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Leave for soccer</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#6B7980" }}>Thursdays · Riverside fields</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 24, paddingTop: 0, paddingRight: 8, paddingBottom: 0, paddingLeft: 8, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#47698A" }}>Trip</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ width: 44, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#4B5960" }}>6:00</Text></View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Dinner</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#6B7980" }}>See meal plan</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 24, paddingTop: 0, paddingRight: 8, paddingBottom: 0, paddingLeft: 8, backgroundColor: "#F3E1E3", borderRadius: 999, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B2328" }}>Food</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16 }}>
            <View style={{ width: 44, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#4B5960" }}>6:45</Text></View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Bath, then quiet time</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#6B7980" }}>Daily</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 50, backgroundColor: "transparent", borderRadius: 999, borderWidth: 2.0, borderColor: "#C9D3DD", borderStyle: "dashed" }}>{/* -> P20a-RoutineItem.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#47698A" }}>+ Add task</Text>
        </View>
      </View>
      {/* tab bar: drawn by the app's tab navigator */}
    </View>
  );
}
