// GENERATED from wireframe P22b-ChildAddedShifts.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Image } from 'expo-image';
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>"
];

/** Child added */
export default function WF_P22b() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 18, flexGrow: 1, paddingTop: 64, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", alignItems: "center", gap: 14 }}>
          <Image source={require('@/assets/images/badger-teddy.png')} style={{ flexShrink: 0, width: 136, height: 170 }} contentFit="contain" />
          <Text style={{ fontFamily: font.display, fontSize: 30, color: "#1B2328", marginVertical: -6.03, textAlign: "center" }}>Welcome, Mia!</Text>
          <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", lineHeight: 22, textAlign: "center" }}>Ava, Leo and Mia are all set.</Text>
        </View>
        <View style={{ flexDirection: "column", paddingTop: 10, paddingRight: 16, paddingBottom: 10, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 36 }}>
            <SvgXml xml={SVG[0]} width={20} height={20} />
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>5 tasks added to the care plan</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 36 }}>
            <SvgXml xml={SVG[1]} width={20} height={20} />
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Food to avoid shows on every shift</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 36 }}>
            <SvgXml xml={SVG[2]} width={20} height={20} />
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Maya was told and can see Mia</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 36 }}>
            <SvgXml xml={SVG[3]} width={20} height={20} />
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Added to 3 booked shifts</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 36 }}>
            <SvgXml xml={SVG[4]} width={20} height={20} />
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Sunshine Daycare saved as a place</Text>
          </View>
        </View>
        <View style={{ flexGrow: 1, flexDirection: "column" }}>
        </View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P13-KidsDevices.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Done</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> P7-CarePlan.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Review Mia’s care plan</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
