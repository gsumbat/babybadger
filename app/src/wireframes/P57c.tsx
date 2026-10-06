// GENERATED from wireframe P57c-PlaceNotFound.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"11\" cy=\"11\" r=\"6.5\"></circle><path d=\"M16 16l4.5 4.5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z\"></path><circle cx=\"12\" cy=\"10\" r=\"2.5\"></circle></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>"
];

/** Edit Home · Not Found */
export default function WF_P57c() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P56-Places.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62, flexGrow: 1, flexShrink: 1 }}>Home</Text>
        <View style={{ flexDirection: "row", alignItems: "center", height: 36, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P56-Places.dc.html */}
          <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#FFFFFF" }}>Save</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, minHeight: 0, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{}}><Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960" }}>Name</Text></View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 48, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#C3CCD5" }}>
            <TextInput placeholder="" defaultValue="Home" placeholderTextColor="#6B7980" style={{ minWidth: 0, flexGrow: 1, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, backgroundColor: "transparent", flexShrink: 1, fontFamily: font.body, fontSize: 15, color: "#1B2328" }} />
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{}}><Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960" }}>Address</Text></View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 48, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#C3CCD5" }}>
            <TextInput placeholder="" defaultValue="214 Bayshor Ct, Tampa, FL 33606" placeholderTextColor="#6B7980" style={{ minWidth: 0, flexGrow: 1, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, backgroundColor: "transparent", flexShrink: 1, fontFamily: font.body, fontSize: 15, color: "#1B2328" }} />
            <SvgXml xml={SVG[1]} width={18} height={18} />
          </View>
        </View>
        <View style={{ height: 128, flexShrink: 0, backgroundColor: "#E9EFE4", borderRadius: 18, overflow: "hidden", minHeight: 0, flexDirection: "column" }}>
          <View style={{ height: 14, top: 44, left: 0, right: 0, backgroundColor: "#FFFFFF", position: "absolute", flexDirection: "column" }}>
          </View>
          <View style={{ width: 12, top: 0, left: 228, bottom: 0, backgroundColor: "#FFFFFF", position: "absolute", flexDirection: "column" }}>
          </View>
          <View style={{ height: 8, top: 98, left: 0, right: 0, backgroundColor: "#FFFFFF", position: "absolute", flexDirection: "column" }}>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", height: 26, right: 10, bottom: 10, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 999, position: "absolute" }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B2328" }}>Clock-in zone · 150 ft</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, paddingTop: 12, paddingRight: 12, paddingBottom: 12, paddingLeft: 12, backgroundColor: "#F6E3C6", borderRadius: 16 }}>
          <SvgXml xml={SVG[2]} width={18} height={18} />
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexGrow: 1, flexShrink: 1 }}>We couldn’t find this address on the map. Check it: sitters can’t clock in here until it’s found.</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960" }}>Clock-in zone size</Text>
          <View style={{ flexDirection: "column", gap: 4, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 999, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.bodyMedium, fontSize: 13, color: "#4B5960" }}>Small · 75 ft</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#FFFFFF", borderRadius: 999, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#1B2328" }}>Medium · 150 ft</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 999, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.bodyMedium, fontSize: 13, color: "#4B5960" }}>Large · 300 ft</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>WHO STAYS HERE, AND WHEN</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 36, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A" }}>
              <SvgXml xml={SVG[3]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#34526E" }}>Ava</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 36, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A" }}>
              <SvgXml xml={SVG[4]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#34526E" }}>Leo</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 38, height: 38, backgroundColor: "#47698A", borderRadius: 19, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#FFFFFF" }}>M</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 38, height: 38, backgroundColor: "#47698A", borderRadius: 19, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#FFFFFF" }}>T</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 38, height: 38, backgroundColor: "#47698A", borderRadius: 19, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#FFFFFF" }}>W</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 38, height: 38, backgroundColor: "#47698A", borderRadius: 19, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#FFFFFF" }}>T</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 38, height: 38, backgroundColor: "#FFFFFF", borderRadius: 19, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960" }}>F</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 38, height: 38, backgroundColor: "#FFFFFF", borderRadius: 19, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960" }}>S</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 38, height: 38, backgroundColor: "#FFFFFF", borderRadius: 19, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960" }}>S</Text>
            </View>
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Shifts on these days start here. You can change it per shift.</Text>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Main address</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Shown first when you book a shift</Text>
            </View>
            <View style={{ width: 50, height: 30, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 15, flexDirection: "column" }}>
              <View style={{ width: 24, height: 24, top: 3, right: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56 }}>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Sitters see the address</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Only during shifts at this home</Text>
            </View>
            <View style={{ width: 50, height: 30, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 15, flexDirection: "column" }}>
              <View style={{ width: 24, height: 24, top: 3, right: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{}}><Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960" }}>Arriving notes for sitters</Text></View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 48, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#C3CCD5" }}>
            <TextInput placeholder="" defaultValue="Gate code 4721 \u00b7 park on the street" placeholderTextColor="#6B7980" style={{ minWidth: 0, flexGrow: 1, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, backgroundColor: "transparent", flexShrink: 1, fontFamily: font.body, fontSize: 15, color: "#1B2328" }} />
          </View>
        </View>
        <View style={{ alignSelf: "center", paddingTop: 6, paddingRight: 6, paddingBottom: 6, paddingLeft: 6 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#A1321F", textDecorationLine: "underline" }}>Remove this address</Text></View>
      </View>
    </View>
  );
}
