// GENERATED from wireframe S5-LogFood.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2.5\"></rect><circle cx=\"12\" cy=\"13.5\" r=\"3.5\"></circle><path d=\"M8.5 7l1.5-2.5h4L15.5 7\"></path></svg>"
];

/** Log food */
export default function WF_S5() {
  return (
    <View style={{ flex: 1, backgroundColor: "#5E6B70", flexDirection: "column", overflow: "hidden", justifyContent: "flex-end" }}>
      <View style={{ flexDirection: "column", gap: 16, paddingTop: 12, paddingRight: 20, paddingBottom: 32, paddingLeft: 20, backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <View style={{ alignSelf: "center", width: 40, height: 5, backgroundColor: "#C3CCD5", borderRadius: 3, flexDirection: "column" }}>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexShrink: 1 }}>Log food</Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> S4-ActiveShift.dc.html */}
            <Text style={{ fontFamily: font.body, fontSize: 20, color: "#1B2328" }}>×</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Who</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#F3E1E3", borderRadius: 999, borderWidth: 2.0, borderColor: "#47698A", flexShrink: 1, justifyContent: "center" }}><Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Ava</Text></View>
            <View style={{ height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, justifyContent: "center" }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Leo</Text></View>
            <View style={{ height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, justifyContent: "center" }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Both</Text></View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 4, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#E8ECF1", borderRadius: 12 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <View style={{ height: 38, backgroundColor: "#FFFFFF", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>Snack</Text></View>
            <View style={{ height: 38, backgroundColor: "transparent", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Breakfast</Text></View>
            <View style={{ height: 38, backgroundColor: "transparent", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Lunch</Text></View>
            <View style={{ height: 38, backgroundColor: "transparent", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Dinner</Text></View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>What did they eat?</Text></View>
          <TextInput placeholder="" defaultValue="Apple slices, crackers" placeholderTextColor="#6B7980" style={{ height: 50, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
        </View>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>How much?</Text>
          <View style={{ flexDirection: "column", gap: 8 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ height: 44, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328" }}>None</Text></View>
              <View style={{ height: 44, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328" }}>Some</Text></View>
              <View style={{ height: 44, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328" }}>Most</Text></View>
              <View style={{ height: 44, backgroundColor: "#DCE7F1", borderRadius: 10, borderWidth: 2.0, borderColor: "#47698A", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#47698A" }}>All</Text></View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 64, backgroundColor: "transparent", borderRadius: 999, borderWidth: 2.0, borderColor: "#C9D3DD", borderStyle: "dashed" }}>
          <SvgXml xml={SVG[0]} width={22} height={22} />
          <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#47698A" }}>Add a photo</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, backgroundColor: "#47698A", borderRadius: 999 }}>{/* -> S4-ActiveShift.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Save and notify parents</Text>
        </View>
      </View>
    </View>
  );
}
