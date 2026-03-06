package http

import "github.com/gin-gonic/gin"

type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

func JSONOK(c *gin.Context, data interface{}) {
	c.JSON(200, APIResponse{Success: true, Data: data})
}

func JSONCreated(c *gin.Context, data interface{}) {
	c.JSON(201, APIResponse{Success: true, Data: data})
}

func JSONError(c *gin.Context, status int, err error) {
	c.JSON(status, APIResponse{Success: false, Error: err.Error()})
}

