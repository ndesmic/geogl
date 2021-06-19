# [.WebGL-0000178000215C00] GL_INVALID_ENUM: Texture filter not recognized

Caused by having a MAG_FILTER that uses mipmaps.  Can't do this.

# [.WebGL-0000178000214200] GL_INVALID_OPERATION: The texture is a non-power-of-two texture.

Caused by using a non-power 2 texture with WebGL 1.  Fixed by switching to WebGL 2.