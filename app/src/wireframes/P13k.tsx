// GENERATED from wireframe P13k-Kids.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"></path><path d=\"M8.5 12l2.5 2.5 4.5-4.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #5F6D74; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"6.5\" y=\"6.5\" width=\"11\" height=\"11\" rx=\"3\"></rect><path d=\"M9 6.5l.8-4h4.4l.8 4M9 17.5l.8 4h4.4l.8-4\"></path></svg>"
];

/** Devices */
export default function WF_P13k() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P12-Settings.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexShrink: 1 }}>Devices</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 8, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 12, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#B86A82", borderRadius: 22 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 18, color: "#FFFFFF" }}>A</Text>
            </View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 18, color: "#1B2328", marginVertical: -3.42 }}>Ava, 7</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>No device yet</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 999, borderWidth: 2.0, borderColor: "#C9D3DD", borderStyle: "dashed", opacity: 0.55 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#47698A" }}>+ Add Ava’s device</Text>
            <View style={{ flexDirection: "row", alignItems: "center", height: 24, flexShrink: 0, paddingTop: 0, paddingRight: 9, paddingBottom: 0, paddingLeft: 9, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Coming soon</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 12, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#8676B3", borderRadius: 22 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 18, color: "#FFFFFF" }}>L</Text>
            </View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 18, color: "#1B2328", marginVertical: -3.42 }}>Leo, 4</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>No device yet</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 999, borderWidth: 2.0, borderColor: "#C9D3DD", borderStyle: "dashed", opacity: 0.55 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#47698A" }}>+ Add Leo’s device</Text>
            <View style={{ flexDirection: "row", alignItems: "center", height: 24, flexShrink: 0, paddingTop: 0, paddingRight: 9, paddingBottom: 0, paddingLeft: 9, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Coming soon</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#DCE7F1", borderRadius: 16 }}>
          <SvgXml xml={SVG[1]} width={22} height={22} />
          <View style={{ flexDirection: "column", gap: 2, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#34526E" }}>Parents see kids' devices anytime</Text>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>Sitters see them only during their own shift.</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, opacity: 0.55, ...cardShadow }}>
          <SvgXml xml={SVG[2]} width={22} height={22} />
          <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Watches and trackers</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>GPS tag for kids without a phone</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", height: 24, flexShrink: 0, paddingTop: 0, paddingRight: 9, paddingBottom: 0, paddingLeft: 9, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Coming soon</Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 10, paddingTop: 8, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> P18-AddChild.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Add a child</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, opacity: 0.55, flexShrink: 1 }}>
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Add a device</Text>
        </View>
      </View>
    </View>
  );
}
