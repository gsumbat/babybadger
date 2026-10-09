// GENERATED from wireframe P7h-CarePlanHelper.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"9\" cy=\"8\" r=\"3.5\"></circle><path d=\"M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.8.7 3 2.3 3 4.7\"></path></svg>"
];

/** Care plan · family helper */
export default function WF_P7h() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 14, paddingTop: 20, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P4b-HomeIdle.dc.html */}
            <SvgXml xml={SVG[0]} width={22} height={22} />
          </View>
          <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Care plan</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 10, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>KIDS’ DAYS</Text>
        <View style={{ flexDirection: "column", backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> P20h-ChildRoutineHelper.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#E8B9BE", borderRadius: 18 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#8A3F5A" }}>A</Text>
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Ava’s day</Text>
              <View style={{ overflow: "hidden", flexShrink: 1, minHeight: 0, justifyContent: "center" }}><Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: 13, color: "#6B7980" }}>School 8–3 · Soccer Thu 4:30 · Bedtime 8</Text></View>
            </View>
            <SvgXml xml={SVG[1]} width={18} height={18} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16 }}>{/* -> P20h-ChildRoutineHelper.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#2F6FD6", borderRadius: 18 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#FFFFFF" }}>L</Text>
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Leo’s day</Text>
              <View style={{ overflow: "hidden", flexShrink: 1, minHeight: 0, justifyContent: "center" }}><Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: 13, color: "#6B7980" }}>Nap 1–3 · Bottle every 3 hrs · Bedtime 7:30</Text></View>
            </View>
            <SvgXml xml={SVG[2]} width={18} height={18} />
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 14 }}>FAMILY TO-DOS</Text>
        <View style={{ flexDirection: "column", backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ width: 44, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#4B5960" }}>3:15</Text></View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Pick up Ava</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#6B7980" }}>Lincoln Elementary · alert on arrival</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ width: 44, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#4B5960" }}>3:30</Text></View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Snack</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#6B7980" }}>Fruit and crackers</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ width: 44, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#4B5960" }}>4:10</Text></View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Leave for soccer</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#6B7980" }}>Thursdays · Riverside fields</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ width: 44, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#4B5960" }}>6:00</Text></View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Dinner</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#6B7980" }}>See meal plan</Text>
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
        <View style={{ flexDirection: "row", gap: 12, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
          <SvgXml xml={SVG[3]} width={22} height={22} />
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B2328", lineHeight: 18, flexShrink: 1 }}>Jen manages the care plan.</Text>
        </View>
      </View>
      {/* tab bar: drawn by the app's tab navigator */}
    </View>
  );
}
