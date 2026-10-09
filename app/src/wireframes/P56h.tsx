// GENERATED from wireframe P56h-PlacesHelper.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"21\" height=\"21\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M3 11l9-7 9 7\"></path><path d=\"M5 10v10h14V10\"></path><path d=\"M10 20v-5h4v5\"></path></svg>",
  "<svg width=\"21\" height=\"21\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #9A4F64; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M3 11l9-7 9 7\"></path><path d=\"M5 10v10h14V10\"></path><path d=\"M10 20v-5h4v5\"></path></svg>",
  "<svg width=\"21\" height=\"21\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z\"></path><path d=\"M4 19V5\"></path></svg>",
  "<svg width=\"21\" height=\"21\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"8.5\"></circle><path d=\"M12 7.5l4 3-1.5 4.5h-5L8 10.5z\"></path></svg>",
  "<svg width=\"21\" height=\"21\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z\"></path><path d=\"M12 10v5M9.5 12.5h5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"9\" cy=\"8\" r=\"3.5\"></circle><path d=\"M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.8.7 3 2.3 3 4.7\"></path></svg>"
];

/** Homes and places · family helper */
export default function WF_P56h() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P12-Settings.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62, flexGrow: 1, flexShrink: 1 }}>Homes and places</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 10, minHeight: 0, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>HOMES · 2</Text>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18, marginTop: -4 }}>Where the kids live. A sitter can clock in only at a home address.</Text>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
              <SvgXml xml={SVG[1]} width={21} height={21} />
            </View>
            <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Home</Text>
                <View style={{ flexDirection: "row", alignItems: "center", height: 22, paddingTop: 0, paddingRight: 8, paddingBottom: 0, paddingLeft: 8, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#34526E" }}>MAIN</Text>
                </View>
              </View>
              <View style={{ overflow: "hidden", flexShrink: 1, minHeight: 0, justifyContent: "center" }}><Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>214 Bayshore Ct, Tampa, FL 33606</Text></View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
                <View style={{ flexDirection: "row", paddingLeft: 6, flexShrink: 1 }}>
                  <View style={{ flexDirection: "row", marginLeft: -6, borderRadius: 999, borderWidth: 2.0, borderColor: "#FFFFFF", flexShrink: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 22, height: 22, flexShrink: 0, backgroundColor: "#E8B9BE", borderRadius: 11 }}>
                      <Text style={{ fontFamily: font.displayBold, fontSize: 10, color: "#8A3F5A" }}>A</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", marginLeft: -6, borderRadius: 999, borderWidth: 2.0, borderColor: "#FFFFFF", flexShrink: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 22, height: 22, flexShrink: 0, backgroundColor: "#2F6FD6", borderRadius: 11 }}>
                      <Text style={{ fontFamily: font.displayBold, fontSize: 10, color: "#FFFFFF" }}>L</Text>
                    </View>
                  </View>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#6B7980", flexShrink: 1 }}>Mon – Thu</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#F3E1E3", borderRadius: 14 }}>
              <SvgXml xml={SVG[2]} width={21} height={21} />
            </View>
            <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Sam's apartment</Text>
              </View>
              <View style={{ overflow: "hidden", flexShrink: 1, minHeight: 0, justifyContent: "center" }}><Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>88 Channelside Dr, Apt 4B, Tampa</Text></View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
                <View style={{ flexDirection: "row", paddingLeft: 6, flexShrink: 1 }}>
                  <View style={{ flexDirection: "row", marginLeft: -6, borderRadius: 999, borderWidth: 2.0, borderColor: "#FFFFFF", flexShrink: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 22, height: 22, flexShrink: 0, backgroundColor: "#E8B9BE", borderRadius: 11 }}>
                      <Text style={{ fontFamily: font.displayBold, fontSize: 10, color: "#8A3F5A" }}>A</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", marginLeft: -6, borderRadius: 999, borderWidth: 2.0, borderColor: "#FFFFFF", flexShrink: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 22, height: 22, flexShrink: 0, backgroundColor: "#2F6FD6", borderRadius: 11 }}>
                      <Text style={{ fontFamily: font.displayBold, fontSize: 10, color: "#FFFFFF" }}>L</Text>
                    </View>
                  </View>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#6B7980", flexShrink: 1 }}>Fri – Sun</Text>
              </View>
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 14 }}>OTHER PLACES · 3</Text>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18, marginTop: -4 }}>You get an alert when the sitter and kids arrive or leave.</Text>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#E8ECF1", borderRadius: 14 }}>
              <SvgXml xml={SVG[3]} width={21} height={21} />
            </View>
            <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Lincoln Elementary</Text>
              </View>
              <View style={{ overflow: "hidden", flexShrink: 1, minHeight: 0, justifyContent: "center" }}><Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>1207 W Swann Ave, Tampa</Text></View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
                <View style={{ flexDirection: "row", paddingLeft: 6, flexShrink: 1 }}>
                  <View style={{ flexDirection: "row", marginLeft: -6, borderRadius: 999, borderWidth: 2.0, borderColor: "#FFFFFF", flexShrink: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 22, height: 22, flexShrink: 0, backgroundColor: "#E8B9BE", borderRadius: 11 }}>
                      <Text style={{ fontFamily: font.displayBold, fontSize: 10, color: "#8A3F5A" }}>A</Text>
                    </View>
                  </View>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#6B7980", flexShrink: 1 }}>School · 8–3</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#E8ECF1", borderRadius: 14 }}>
              <SvgXml xml={SVG[4]} width={21} height={21} />
            </View>
            <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Soccer field</Text>
              </View>
              <View style={{ overflow: "hidden", flexShrink: 1, minHeight: 0, justifyContent: "center" }}><Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Kate Jackson Park, Tampa</Text></View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
                <View style={{ flexDirection: "row", paddingLeft: 6, flexShrink: 1 }}>
                  <View style={{ flexDirection: "row", marginLeft: -6, borderRadius: 999, borderWidth: 2.0, borderColor: "#FFFFFF", flexShrink: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 22, height: 22, flexShrink: 0, backgroundColor: "#E8B9BE", borderRadius: 11 }}>
                      <Text style={{ fontFamily: font.displayBold, fontSize: 10, color: "#8A3F5A" }}>A</Text>
                    </View>
                  </View>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#6B7980", flexShrink: 1 }}>Thu 4:30</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#E8ECF1", borderRadius: 14 }}>
              <SvgXml xml={SVG[5]} width={21} height={21} />
            </View>
            <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Grandma Rosa's</Text>
              </View>
              <View style={{ overflow: "hidden", flexShrink: 1, minHeight: 0, justifyContent: "center" }}><Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>3410 W San Nicholas St, Tampa</Text></View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
                <View style={{ flexDirection: "row", paddingLeft: 6, flexShrink: 1 }}>
                  <View style={{ flexDirection: "row", marginLeft: -6, borderRadius: 999, borderWidth: 2.0, borderColor: "#FFFFFF", flexShrink: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 22, height: 22, flexShrink: 0, backgroundColor: "#E8B9BE", borderRadius: 11 }}>
                      <Text style={{ fontFamily: font.displayBold, fontSize: 10, color: "#8A3F5A" }}>A</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", marginLeft: -6, borderRadius: 999, borderWidth: 2.0, borderColor: "#FFFFFF", flexShrink: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 22, height: 22, flexShrink: 0, backgroundColor: "#2F6FD6", borderRadius: 11 }}>
                      <Text style={{ fontFamily: font.displayBold, fontSize: 10, color: "#FFFFFF" }}>L</Text>
                    </View>
                  </View>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#6B7980", flexShrink: 1 }}>Visits</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 12, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
          <SvgXml xml={SVG[6]} width={22} height={22} />
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B2328", lineHeight: 18, flexShrink: 1 }}>Jen manages homes and places.</Text>
        </View>
      </View>
      {/* tab bar: drawn by the app's tab navigator */}
    </View>
  );
}
