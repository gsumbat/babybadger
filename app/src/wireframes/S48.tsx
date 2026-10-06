// GENERATED from wireframe S48-LogDiaper.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  
];

/** Log diaper or potty */
export default function WF_S48() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", justifyContent: "flex-end", flexGrow: 1, backgroundColor: "#5E6B70" }}>
        <View style={{ flexDirection: "column", gap: 14, paddingTop: 12, paddingRight: 20, paddingBottom: 30, paddingLeft: 20, backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <View style={{ alignSelf: "center", width: 40, height: 5, backgroundColor: "#C3CCD5", borderRadius: 3, flexDirection: "column" }}>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexShrink: 1 }}>Diaper or potty</Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> S4-ActiveShift.dc.html */}
              <Text style={{ fontFamily: font.body, fontSize: 20, color: "#1B2328" }}>×</Text>
            </View>
          </View>
          <View style={{ flexDirection: "column", gap: 8 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>Who</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Ava</Text>
              </View>
              <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#F3E1E3", borderRadius: 999, borderWidth: 2.0, borderColor: "#47698A", flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Leo</Text>
              </View>
              <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Both</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "column", gap: 8 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>Diaper</Text>
            <View style={{ flexDirection: "column", gap: 8 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", minHeight: 44, paddingTop: 4, paddingRight: 6, paddingBottom: 4, paddingLeft: 6, backgroundColor: "#DCE7F1", borderRadius: 12, borderWidth: 2.0, borderColor: "#47698A", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#47698A", marginVertical: -3.52, textAlign: "center" }}>#1</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", minHeight: 44, paddingTop: 4, paddingRight: 6, paddingBottom: 4, paddingLeft: 6, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#1B2328", marginVertical: -3.52, textAlign: "center" }}>#2</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", minHeight: 44, paddingTop: 4, paddingRight: 6, paddingBottom: 4, paddingLeft: 6, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#1B2328", marginVertical: -3.52, textAlign: "center" }}>Both</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", minHeight: 44, paddingTop: 4, paddingRight: 6, paddingBottom: 4, paddingLeft: 6, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#1B2328", marginVertical: -3.52, textAlign: "center" }}>Dry</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "column", gap: 8 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>Potty try</Text>
            <View style={{ flexDirection: "column", gap: 8 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", minHeight: 44, paddingTop: 4, paddingRight: 6, paddingBottom: 4, paddingLeft: 6, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#1B2328", marginVertical: -3.52, textAlign: "center" }}>Not today</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", minHeight: 44, paddingTop: 4, paddingRight: 6, paddingBottom: 4, paddingLeft: 6, backgroundColor: "#DCE7F1", borderRadius: 12, borderWidth: 2.0, borderColor: "#47698A", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#47698A", marginVertical: -3.52, textAlign: "center" }}>Tried</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", minHeight: 44, paddingTop: 4, paddingRight: 6, paddingBottom: 4, paddingLeft: 6, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#1B2328", marginVertical: -3.52, textAlign: "center" }}>Success!</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Time</Text>
            <Text style={{ fontFamily: font.display, fontSize: 18, color: "#1B2328", flexShrink: 1 }}>5:15 PM <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#47698A" }}>Change</Text></Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44 }}>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Rash or anything unusual</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Adds a note and flags it for Jen</Text>
            </View>
            <View style={{ width: 50, height: 30, flexShrink: 0, backgroundColor: "#C3CCD5", borderRadius: 15, flexDirection: "column" }}>
              <View style={{ width: 24, height: 24, top: 3, left: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 999 }}>{/* -> S4-ActiveShift.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Save and notify parents</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
